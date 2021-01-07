const express = require('express');
const parser = require('body-parser');

const users = require('./routes/users');

const app = express();
const PORT = 5001 || process.env.PORT;

app.use(parser.json())
app.use('/api', users);

app.get('/', (request, response) => {
    response.status(200).json({ message: 'Online' });
});


app.listen(PORT, () =>  console.log(`Server online at port ${PORT}`));

