require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Auth routes (direct to auth-service)
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:5001',
  changeOrigin: true,
}));

// Protected routes - verify token then proxy
app.use('/api/candidatures', (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ message: 'Access denied. No valid token' });
  }
  next();
}, createProxyMiddleware({
  target: 'http://candidature-service:5002',
  changeOrigin: true,
}));

app.use('/api/ai', (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ message: 'Access denied. No valid token' });
  }
  next();
}, createProxyMiddleware({
  target: 'http://ai-document-service:5003',
  changeOrigin: true,
}));

app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway Running', services: ['auth', 'candidatures', 'ai'] });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
