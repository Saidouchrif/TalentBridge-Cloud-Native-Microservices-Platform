const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const applicationRoutes = require('./Routes/ApplicationRoute');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/applications', applicationRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Candidature-Service is running on port ${PORT}`);
});