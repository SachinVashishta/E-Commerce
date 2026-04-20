const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/auth')
const dotenv = require('dotenv');
const ChatSocket = require('./Socket/ChatSocket')
const http = require('http')
const { Server } = require('socket.io');
const app = express();
 const server = http.createServer(app);

dotenv.config();



// Middleware
const io = new Server(server,{
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
ChatSocket(io);

app.use(cors({ origin: process.env.CLIENT_URL , credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',authRouter);
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
