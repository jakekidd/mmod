use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// Define the DataStorage struct
pub struct DataStorage {
    // Using HashMap to store data, where key is some identifier and value is the data
    data: Arc<Mutex<HashMap<String, Vec<u8>>>>,
}

impl DataStorage {
    // Constructor to create a new DataStorage instance
    pub fn new() -> Self {
        DataStorage {
            data: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    // Method to store data in the storage
    pub fn store_data(&self, key: String, data: Vec<u8>) {
        // Acquire the mutex lock and insert the data into the HashMap
        let mut data_map = self.data.lock().unwrap();
        data_map.insert(key, data);
    }

    // Method to retrieve data from the storage
    pub fn retrieve_data(&self, key: &str) -> Option<Vec<u8>> {
        // Acquire the mutex lock and retrieve data from the HashMap
        let data_map = self.data.lock().unwrap();
        data_map.get(key).cloned()
    }

    // Method to delete data from the storage
    pub fn delete_data(&self, key: &str) {
        // Acquire the mutex lock and remove data from the HashMap
        let mut data_map = self.data.lock().unwrap();
        data_map.remove(key);
    }
}
