use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub mod instruction; // Define la clase instruction que hemos creado en instruction.rs
use crate::instruction::HWInstruction;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint");

    let instruction = HWInstruction::unpack(instruction_data)?; //El interrogante se pone porque
                                                                //La funcion unpack devuelve un Result(HWInstruction o un PogramError), y el interrogante dice
                                                                //que nos promete que es un HWInstruction

    let accounts_iter = &mut accounts.iter();

    let account = next_account_info(accounts_iter)?;

    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;

    match instruction {
        HWInstruction::Increment => greeting_account.counter += 1,
        HWInstruction::Decrement => greeting_account.counter -= 1,
        HWInstruction::Set(val) => greeting_account.counter = val,
    }

    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Greeted {} time(s)!", greeting_account.counter);

    Ok(())
}
