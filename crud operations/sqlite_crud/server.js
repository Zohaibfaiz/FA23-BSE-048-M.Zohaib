const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Connection
const db = new sqlite3.Database('./crud_db.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTable();
    }
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            console.log('Items table created/verified');
        }
    });
}

// Routes

// Create
app.post('/api/items', (req, res) => {
    const { name, description } = req.body;
    const sql = 'INSERT INTO items (name, description) VALUES (?, ?)';
    db.run(sql, [name, description], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, description });
    });
});

// Read All
app.get('/api/items', (req, res) => {
    const sql = 'SELECT * FROM items';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Read One
app.get('/api/items/:id', (req, res) => {
    const sql = 'SELECT * FROM items WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!row) return res.status(404).json({ message: 'Item not found' });
        res.json(row);
    });
});

// Update
app.put('/api/items/:id', (req, res) => {
    const { name, description } = req.body;
    const sql = 'UPDATE items SET name = ?, description = ? WHERE id = ?';
    db.run(sql, [name, description, req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ message: 'Item not found' });
        res.json({ id: req.params.id, name, description });
    });
});

// Delete
app.delete('/api/items/:id', (req, res) => {
    const sql = 'DELETE FROM items WHERE id = ?';
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    });
});

app.listen(PORT, () => {
    console.log(`SQLite CRUD Server running on port ${PORT}`);
});
