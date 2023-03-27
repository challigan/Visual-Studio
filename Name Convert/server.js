const express = require('express');
const bodyParser = require('body-parser');
const nameConverter = require('./nameConverter');
const path = require('path');

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

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
