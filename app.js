const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

// Imports for Security and Rate Limiting
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Imports for Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const adRoutes = require('./routes/ads');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } }); 

// ---------------------- 1. تطبيق تحسينات الأمان ----------------------
app.use(helmet()); 

// ---------------------- 2. تطبيق Rate Limiting ----------------------
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// ---------------------- 3. تطبيق Middleware الأساسي ----------------------
app.use(cors());
app.use(express.json());

// ---------------------- 4. مسارات API ----------------------
app.use('/api/auth', authLimiter, authRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ads', adRoutes);

// Socket.io for Real-Time Chat
const contentNamespace = io.of('/chat');

contentNamespace.on('connection', socket => {
  socket.on('join', ({ contentId, user }) => {
    socket.join(contentId);
    console.log(`${user.email} joined room: ${contentId}`);
    socket.to(contentId).emit('system', { text: `${user.email} انضم للمناقشة.` });
  });

  socket.on('message', ({ contentId, user, text }) => {
    const payload = { 
        user: { id: user.id, email: user.email, role: user.role }, 
        text, 
        createdAt: new Date() 
    };
    contentNamespace.to(contentId).emit('message', payload);
  });

  socket.on('leave', ({ contentId, user }) => {
    socket.leave(contentId);
    console.log(`${user.email} left room: ${contentId}`);
    socket.to(contentId).emit('system', { text: `${user.email} غادر المناقشة.` });
  });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
