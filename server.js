const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;
const cors = require('cors');

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
];

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);

app.listen(port, () => {console.log('Listening on port: ', port);});

// Get all cards - FIXED: Use AS to rename columns
app.get('/allcards', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT id, card_name AS cardname, card_pic AS cardpic FROM cards'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for all cards'});
    }
});

// Remove this duplicate route (not needed)
// app.get('/addcard', async (req, res) => { ... });

// Add a new card
app.post('/addcard', async (req, res) => {
    const { cardname, cardpic } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO cards (card_name, card_pic) VALUES (?, ?)',
            [cardname, cardpic]
        );
        await connection.end();
        res.json({ message: 'Card added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add card' });
    }
});

// Delete a card
app.delete('/deletecard/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cards WHERE id = ?', [req.params.id]);
        await connection.end();
        res.json({ message: 'Card deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete card' });
    }
});

// Edit/Update a card
app.put('/editcard/:id', async (req, res) => {
    const { cardname, cardpic } = req.body;
    const cardId = req.params.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?',
            [cardname, cardpic, cardId]
        );
        await connection.end();
        res.json({ message: 'Card updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update card' });
    }
});