CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);

INSERT IGNORE INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT IGNORE INTO users (name, email) VALUES ('Bob', 'bob@example.com');
INSERT IGNORE INTO users (name, email) VALUES ('Charlie', 'charlie@example.com');
INSERT IGNORE INTO users (name, email) VALUES ('Diana', 'diana@example.com');
