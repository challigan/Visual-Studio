const express = require('express');
const bodyParser = require('body-parser');
const nameConverter = require('./nameConverter');
const path = require('path');
const NetlifyExpress = require('netlify-express');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/convert', (req, res) => {
    const names = req.body.names;
    const nameFormat = req.body.nameFormat;
    const convertedNames = nameConverter.convertNames(names, nameFormat);
    const responseText = nameFormat === 'powerapps' ? `["${convertedNames.join('","')}"]` : convertedNames.join('; ');
    res.send(responseText);
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
