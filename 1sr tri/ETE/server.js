const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');

const app = express();
app.use(bodyParser.json());
app.use('/users', userRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
