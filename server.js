const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const campaignsRoutes = require('./routes/campaigns');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'https://influencerconnect.vercel.app',
      'https://influencer-connect-frontend.vercel.app',
      'https://influencer-connect-frontend.onrender.com',
      'https://influencer-connect-frontend-4yhn5ztzc.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/campaigns', campaignsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
