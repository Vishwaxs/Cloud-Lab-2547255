const express = require('express');
const router = express.Router();

// GET all users
router.get('/', (req, res) => {
  const query = 'SELECT * FROM users ORDER BY created_at DESC';
  
  req.db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM users WHERE id = ?';
  
  req.db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create new user
router.post('/', (req, res) => {
  const { name, email, phone, address } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const query = 'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)';
  
  req.db.query(query, [name, email, phone || null, address || null], (err, results) => {
    if (err) {
      console.error('Error creating user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    res.status(201).json({ 
      message: 'User created successfully', 
      id: results.insertId 
    });
  });
});

// PUT update user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const query = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
  
  req.db.query(query, [name, email, phone || null, address || null, id], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update user' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  });
});

// DELETE user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';
  
  req.db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;