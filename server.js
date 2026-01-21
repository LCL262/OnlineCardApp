const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;
const cors = require('cors'); // Add this line at top

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",  // Add this for Vite
    "http://localhost:5174",  // Sometimes Vite uses this
];

//database config info
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

//initialize Express App
const app = express();
//helps app to read json
app.use(express.json());
app.use(
    cors({
        origin: function (origin, callback) {
// allow requests with no origin (Postman/server-to-server)
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


//Start the server
app.listen(port, () => {console.log('Listening on port: ', port);});

//Example route: get all cards
app.get('/allcards', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for all cards'});
    }
});

app.get('/addcard', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cards');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching cards' });
    }
});

app.post('/addcard', async (req, res) => {
    const { cardname, cardpic } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO cards (cardname, cardpic) VALUES (?, ?)',
            [cardname, cardpic]
        );
        await connection.end();
        res.json({ message: 'Card added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add card' });
    }
});

/*app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params;
    const { cardname, cardpic } = req.body;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE cards SET cardname=?, cardpic=? WHERE id=?', [cardname, cardpic, id]);
        res.status(201).json({ message: 'Card ' + id + ' updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update card ' + id });
    }
});

// Example Route: Delete a card
app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cards WHERE id=?', [id]);
        res.status(201).json({ message: 'Card ' + id + ' deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete card ' + id });
    }
});*/

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
