require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service Running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});