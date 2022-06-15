//Programa: E649Nq7Fz6p3q72XugfKbte7sGeTLUPfmdWTaWdUAtq3

import * as web3 from '@solana/web3.js';
import * as borsh from "borsh";
import * as BufferLayout from "@solana/buffer-layout";
import {Buffer} from "buffer";


/**
 * Connection to the network
 */
 let connection: web3.Connection;

 /**
  * Keypair associated to the fees' payer
  */
 let payer: web3.Keypair;
 
 /**
  * Hello world's program id
  */
 let programId: web3.PublicKey;
 
 /**
  * Greeted account Public Key (PDA)
  */
 let greetedPubkey: web3.PublicKey;

 /**
 * The state of a greeting account managed by the hello world program
 */
class GreetingAccount {
    counter = 0;
    constructor(fields: {counter: number} | undefined = undefined) {
      if (fields) {
        this.counter = fields.counter;
      }
    }
  }
  
  /**
   * Borsh schema definition for greeting accounts
   */
  const GreetingSchema = new Map([
    [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
  ]);
  
  /**
   * The expected size of each greeting account.
   */
  const GREETING_SIZE = borsh.serialize(
    GreetingSchema,
    new GreetingAccount(),
  ).length;


async function main(){
    
    await init();

    console.log("Parametros iniciados.");

    console.log(payer.publicKey);
    console.log(payer.publicKey.toBase58());

    /*await createPDA();

    console.log('Address que genera la PDA: ',payer.publicKey.toBase58());
    console.log('Address de la PDA: ',greetedPubkey.toBase58());

    await sayHello();
    await reportGreetings();*/

}

/**
 * Establish initial parameters
 */
async function init() {
    connection = new web3.Connection(web3.clusterApiUrl("devnet")); 
    
    const payerPrivateKey: Uint8Array = Uint8Array.from(
        [213,14,214,42,51,232,98,222,158,193,214,150,38,147,86,208,59,218,171,46,207,31,179,227,172,51,109,247,44,103,202,48,145,100,104,100,228,15,202,160,134,205,61,236,82,30,85,244,124,125,45,170,232,14,70,103,202,161,218,144,124,244,179,37]
    );

    payer = web3.Keypair.fromSecretKey(payerPrivateKey);
    
    programId = new web3.PublicKey("E649Nq7Fz6p3q72XugfKbte7sGeTLUPfmdWTaWdUAtq3");
}

/**
 * Create PDA of the account that interacts with Smart Contract
 */
async function createPDA(){
    
    const GREETING_SEED = "hola";

    greetedPubkey = await web3.PublicKey.createWithSeed(
        payer.publicKey,
        GREETING_SEED,
        programId,
      );

    const greetedAccount = await connection.getAccountInfo(greetedPubkey);
    if (greetedAccount === null) {
        await connection.getBalance(payer.publicKey).then( balance => {
            console.log("Payer's balance before creating PDA: ", balance/web3.LAMPORTS_PER_SOL);
        } );
        console.log(
        'Creating account',
        greetedPubkey.toBase58(),
        'to say hello to',
        );
        const lamports = await connection.getMinimumBalanceForRentExemption(
        GREETING_SIZE,
        );

        const transaction = new web3.Transaction().add(
        web3.SystemProgram.createAccountWithSeed({
            fromPubkey: payer.publicKey,
            basePubkey: payer.publicKey,
            seed: GREETING_SEED,
            newAccountPubkey: greetedPubkey,
            lamports,
            space: GREETING_SIZE,
            programId,
        }),
        );
        await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
        
        await connection.getBalance(payer.publicKey).then( balance => {
            console.log("Payer's balance after creating PDA: ", balance/web3.LAMPORTS_PER_SOL);
        } );
    }
}

function createIncrementInstruction() : Buffer {
    const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(layout.span);
    layout.encode({instruction: 0}, data);
    return data;
}

function createDecrementInstruction() : Buffer {
  const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);
  const data = Buffer.alloc(layout.span);
  layout.encode({instruction: 1}, data);
  return data;
}

function createSetInstruction() : Buffer {
  const layout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.u32('value')
  ]);
  const data = Buffer.alloc(layout.span);
  layout.encode({instruction: 2, value: 100}, data);
  return data;
}



/**
 * Saying hello to the account
 */
async function sayHello(){
    console.log('Saying hello to', greetedPubkey.toBase58());
    const instruction = new web3.TransactionInstruction({
      keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
      programId,
      data: createIncrementInstruction(), // All instructions are hellos
    });
    await web3.sendAndConfirmTransaction(
      connection,
      new web3.Transaction().add(instruction),
      [payer],
    );
  }

  /**
 * Report the number of times the greeted account has been said hello to
 */
async function reportGreetings(){
    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
      throw 'Error: cannot find the greeted account';
    }
    const greeting = borsh.deserialize(
      GreetingSchema,
      GreetingAccount,
      accountInfo.data,
    );
    console.log(
      greetedPubkey.toBase58(),
      'has been greeted',
      greeting.counter,
      'time(s)',
    );
  }


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });




