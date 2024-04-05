use std::collections::HashMap;

// Define the structure of a block in the blockchain
struct Block {
    number: u64,
    timestamp: u64,
    prev_hash: String,
    data: String,
    hash: String,
}

// Define the blockchain structure
pub struct Blockchain {
    blocks: Vec<Block>,
    index: HashMap<String, usize>,
}

impl Blockchain {
    // Constructor to initialize a new blockchain instance
    pub fn new() -> Self {
        Blockchain {
            blocks: Vec::new(),
            index: HashMap::new(),
        }
    }

    // Add a new block to the blockchain
    pub fn add_block(&mut self, block: Block) {
        // Append the block to the blockchain
        self.blocks.push(block);

        // Update the index with the block's hash and index in the blockchain
        self.index.insert(block.hash.clone(), self.blocks.len() - 1);
    }

    // Validate the integrity of the blockchain.
    pub fn validate(&self) -> bool {
        for (i, block) in self.blocks.iter().enumerate() {
            // Skip the genesis block.
            if i == 0 {
                continue;
            }

            // Validate the current block's previous hash.
            if block.prev_hash != self.blocks[i - 1].hash {
                return false;
            }
        }
        true
    }

    // Get the latest block in the blockchain.
    pub fn latest_block(&self) -> Option<&Block> {
        self.blocks.last()
    }

    // Get a block by its hash.
    pub fn get_block_by_hash(&self, hash: &str) -> Option<&Block> {
        if let Some(&index) = self.index.get(hash) {
            Some(&self.blocks[index])
        } else {
            None
        }
    }
}

// Include necessary libraries.
use std::fmt;

// Implement the Display trait for the Block struct to enable printing blocks in HRF.
impl fmt::Display for Block {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Block {}: Hash: {}, Prev Hash: {}, Timestamp: {}, Data: {}",
            self.number, self.hash, self.prev_hash, self.timestamp, self.data
        )
    }
}
