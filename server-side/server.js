const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


const authRouter = require('./routes/auth');

const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');



dotenv.config();

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://e-commerce-0047.onrender.com"
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());




// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);


// ✅ Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));









// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const authRouter = require('./routes/auth')
// const dotenv = require('dotenv');
// const ChatSocket = require('./Socket/ChatSocket')
// const http = require('http')
// const { Server } = require('socket.io');
// const app = express();
//  const server = http.createServer(app);

// dotenv.config();



// // Middleware
// const io = new Server(server,{
//   cors: {
//     origin: process.env.CLIENT_URL,
//     credentials: true
//   }
// });
// ChatSocket(io);

// app.use(cors({ origin: process.env.CLIENT_URL , credentials: true }));
// app.use(express.json());

// // Routes
// app.use('/api/auth',authRouter);
// app.use('/api/products', require('./routes/products'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/cart', require('./routes/cart'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/messages', require('./routes/messages'));


// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => {
//     console.error('❌ MongoDB Connection Error:', err.message);
//     process.exit(1);
//   });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
