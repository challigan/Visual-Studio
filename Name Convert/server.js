const express = require('express');
const bodyParser = require('body-parser');
const nameConverter = require('./nameConverter');
const path = require('path');
const NetlifyExpress = require('netlify-express');

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/convert', async (req, res) => {
    const names = req.body.names;
    const nameFormat = req.body.nameFormat;
    const convertedNames = nameConverter.convertNames(names, nameFormat);
    const responseText = nameFormat === 'powerapps' ? `["${convertedNames.join('","')}"]` : convertedNames.join('; ');

    // Save the response to the database
    const userId = req.user.sub;
    const timestamp = new Date().toISOString();
    const query = {
        text: 'INSERT INTO conversions (user_id, response_text, timestamp) VALUES ($1, $2, $3)',
        values: [userId, responseText, timestamp]
    };
    await client.query(query);

    // Retrieve the user's last 10 conversions from the database
    const query2 = {
        text: 'SELECT response_text, timestamp FROM conversions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10',
        values: [userId]
    };
    const result = await client.query(query2);
    const conversions = result.rows;

    res.render('index', { conversions, isAuthenticated: true });
});

const netlifyExpress = NetlifyExpress({
  apiPath: '.netlify/functions',
  // You'll need to replace this with your own Netlify Site ID
  // which you can find on the Site settings page in the Netlify UI
  siteID: 'be5cfd63-0377-4d9e-8c7a-4d0d958b9728',
});

app.use(netlifyExpress);

// This is where you define your Netlify Identity settings
const identity = netlifyExpress.identity;
identity.on('login', (user) => console.log(`Logged in as ${user.email}`));
identity.on('logout', () => console.log('Logged out'));

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port 3000');
});
