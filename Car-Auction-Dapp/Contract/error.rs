use anchor_lang::prelude::error_code;

#[error_code]
pub enum LotteryError {
    #[msg("winner already exists")]
    WinnerAlreadyExists,
    #[msg("Can't choose a winner when there are no tickets")]
    NoTickets,
    #[msg("winner not chosen")]
    WinnerNotChoosen,
    #[msg("Invalid Winner")]
    InvalidWinner,
    #[msg("Already Claimed")]
    AlreadyClaimed,
}
