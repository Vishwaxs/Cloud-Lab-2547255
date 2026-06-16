-- Create database
CREATE DATABASE IF NOT EXISTS fullstack_db;
USE fullstack_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email, phone, address) VALUES
('John Doe', 'john@example.com', '123-456-7890', '123 Main St, City, State'),
('Jane Smith', 'jane@example.com', '098-765-4321', '456 Oak Ave, City, State'),
('Mike Johnson', 'mike@example.com', '555-123-4567', '789 Pine Rd, City, State')
ON DUPLICATE KEY UPDATE name=name;
