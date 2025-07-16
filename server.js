const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const campaignsRoutes = require('./routes/campaigns');

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(bodyParser.json());
app.use('/users', userRoutes);
app.use('/campaigns', campaignsRoutes);


app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
