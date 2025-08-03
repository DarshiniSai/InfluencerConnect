const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const campaignsRoutes = require('./routes/campaigns');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.get('/users', (req, res) => {
  res.json([{ id: 1, email: 'test@gmail.com' }]);
});

app.use('/users', userRoutes);
app.use('/campaigns', campaignsRoutes);
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
