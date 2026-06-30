require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors')
const morgan = require('morgan');
const {Server} = require('socket.io');

const authRoutes = require('./routes/auth.routes')

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'https://localhost:4200').split(',');

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req,res) => {
    res.json({ status: 'ok', timestam: new Date().toISOString() })
});

app.use('/api/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, credentials: true },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});