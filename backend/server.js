// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db');
const morgan = require('morgan');

const app = express();
connectDB();

// 🔐 Sécurité HTTP headers
app.use(helmet());

app.use(express.json({ limit: '10kb' }));

app.use(cors({
  origin: "https://exam-blanc.onrender.com/",
  credentials: true
}));

app.use(morgan('dev'));

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));