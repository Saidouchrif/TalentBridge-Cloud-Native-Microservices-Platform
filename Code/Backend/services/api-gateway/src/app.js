require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware l-assasiya
app.use(cors());
app.use(express.json());

// Verifi wach JWT_SECRET kayna f .env
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}

// Fonction bach n-verifiw l-token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware dyal l-protection (Auth Guard)
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  // N-ajouter l-user data f req bach ila htajiha l-proxy
  req.user = decoded;
  next();
};

---

### 🛣️ Les Routes (Proxies)

// 1. Auth Service (Public: ma-fihch verifyToken)
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:5001', // Beddelha l-localhost:5001 ila knti bla Docker
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' }, // Ila knti m-smmi l-routes f l-service "/auth"
}));

// 2. Candidatures Service (Protected)
app.use('/api/candidatures', authenticate, createProxyMiddleware({
  target: 'http://candidature-service:5002',
  changeOrigin: true,
  pathRewrite: { '^/api/candidatures': '/candidatures' },
}));

// 3. AI Document Service (Protected)
app.use('/api/ai', authenticate, createProxyMiddleware({
  target: 'http://ai-document-service:5003',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/ai' },
}));

---

### 🏥 Health Check & Server
app.get('/health', (req, res) => {
  res.json({ 
    status: 'API Gateway Running', 
    timestamp: new Date(),
    services: ['auth', 'candidatures', 'ai'] 
  });
});

app.listen(PORT, () => {
  console.log(`✅ TalentBridge API Gateway running on port ${PORT}`);
});