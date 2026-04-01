const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/auth')
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(express.json());

// Routes
app.use('/api/auth',authRouter);
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sachinVashishtdb_user:<db_password>@cluster0.3o4awij.mongodb.net/?appName=Cluster0')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
