const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your MySQL password
    database: 'crud_op_demo' // We will create this if not exists
});

// Connect
db.connect(err => {
    if (err) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            // Create DB if not exists
            const tempDb = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: ''
            });
            tempDb.query('CREATE DATABASE IF NOT EXISTS crud_op_demo', (err) => {
                if (err) throw err;
                console.log('Database created/verified.');
                tempDb.end();
                // Reconnect
                db.changeUser({ database: 'crud_op_demo' }, (err) => {
                    if (err) throw err;
                    console.log('MySQL Connected to crud_op_demo');
                    createTable();
                });
            });
        } else {
            console.error('Database connection failed: ' + err.stack);
            return;
        }
    } else {
        console.log('MySQL Connected');
        createTable();
    }
});

function createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
    )`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('Items table created/verified');
    });
}


// Routes

// Create
app.post('/api/items', (req, res) => {
    const { name, description } = req.body;
    const sql = 'INSERT INTO items (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, name, description });
    });
});

// Read All
app.get('/api/items', (req, res) => {
    const sql = 'SELECT * FROM items';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Read One
app.get('/api/items/:id', (req, res) => {
    const sql = 'SELECT * FROM items WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'Item not found' });
        res.json(result[0]);
    });
});

// Update
app.put('/api/items/:id', (req, res) => {
    const { name, description } = req.body;
    const sql = 'UPDATE items SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });
        res.json({ id: req.params.id, name, description });
    });
});

// Delete
app.delete('/api/items/:id', (req, res) => {
    const sql = 'DELETE FROM items WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    });
});

app.listen(PORT, () => {
    console.log(`MySQL CRUD Server running on port ${PORT}`);
});
