const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const aiRoutes = require('./Routes/AiRoute');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/ai', aiRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`AI-Document-Service is running on port ${PORT}`);
});