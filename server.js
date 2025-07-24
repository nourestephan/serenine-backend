// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_o60QIfSYjOPN@ep-empty-glitter-a2k3k2x0-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

app.post('/submit', async (req, res) => {
  const { name, mood, stressLevel, journal } = req.body;
  try {
    await pool.query(
      'INSERT INTO responses (name, mood, stress_level, journal) VALUES ($1, $2, $3, $4)',
      [name, mood, stressLevel, journal]
    );
    res.status(200).send('Submitted successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Submission failed.');
  }
});

app.get('/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        name TEXT,
        mood TEXT,
        stress_level INT,
        journal TEXT,
        submitted_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    res.send('Database initialized.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error initializing DB');
  }
});

app.get('/responses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM responses ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Failed to fetch responses.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
