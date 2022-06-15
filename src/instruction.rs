use solana_program::program_error::ProgramError;
//Debug derive to print code
#[derive(Debug)]
pub enum HWInstruction {
    Increment,
    Decrement,
    Set(u32),
}

impl HWInstruction {
    //Result es un Enum en Rust que devuelve 2 variables:
    //Success en caso de que todo vaya bien, que es una instruccion de HW
    //O error en caso contrario, que es un program error
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        match tag {
            0 => return Ok(HWInstruction::Increment),
            1 => return Ok(HWInstruction::Decrement),
            2 => {
                if rest.len() != 4 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let val: Result<[u8; 4], _> = rest[..4].try_into();
                match val {
                    Ok(i) => return Ok(HWInstruction::Set(u32::from_le_bytes(i))),
                    _ => return Err(ProgramError::InvalidInstructionData),
                }
            }
            _ => return Err(ProgramError::InvalidInstructionData),
        }
    }
}
