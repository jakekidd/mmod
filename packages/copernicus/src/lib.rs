// Import necessary modules
mod blockchain;
mod consensus;
mod data_storage;
mod network_manager;
mod reward_calculator;
mod staking_manager;
mod transaction_handler;

// Re-export public interfaces
pub use blockchain::Blockchain;
pub use consensus::Consensus;
pub use data_storage::DataStorage;
pub use network_manager::NetworkManager;
pub use reward_calculator::RewardCalculator;
pub use staking_manager::StakingManager;
pub use transaction_handler::{Transaction, TransactionError, TransactionHandler};
