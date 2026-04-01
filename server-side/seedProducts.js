const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect('mongodb+srv://sachinVashishtdb_user:ShivShankar22@cluster0.3o4awij.mongodb.net/?appName=Cluster0');
    console.log('MongoDB Connected for seeding');

    // Seed Admin User (if not exists)
    let admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = new User({
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@test.com / admin123');
    }

    // Clear & seed products
    await Product.deleteMany({});
    const products = [
      {
        title: 'iPhone 15 Pro',
        brand: 'Apple',
        description: 'Latest Apple flagship with titanium design',
        price: 999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1690906857151-62b9dd3a91f9?w=400',
        stock: 10,
        featured: true
      },
      {
        title: 'MacBook Pro M3',
        brand: 'Apple',
        description: 'Apple laptop with M3 chip',
        price: 1999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1610945262588-b4c94b625d93?w=400',
        stock: 5,
        featured: true
      },
      {
        title: 'Nike Air Max 90',
        brand: 'Nike',
        description: 'Iconic running shoes',
        price: 129,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        stock: 20
      },
      {
        title: "Levi's 501 Jeans",
        brand: "Levi's",
        description: 'Classic straight fit',
        price: 89,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        stock: 15
      },
      {
        title: 'Atomic Habits',
        brand: 'James Clear',
        description: 'James Clear bestseller',
        price: 14,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        stock: 50
      },
      {
        title: 'Psychology of Money',
        brand: 'Morgan Housel',
        description: 'Timeless lessons by Morgan Housel',
        price: 18,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        stock: 30
      },
      {
        title: 'Sony WH-1000XM5',
        brand: 'Sony',
        description: 'Best noise cancelling headphones',
        price: 399,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1612689811367-64feb4a52f46?w=400',
        stock: 8
      },
      {
        title: 'Adidas Ultraboost',
        brand: 'Adidas',
        description: 'Responsive running shoes',
        price: 179,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        stock: 12
      }
    ];
    await Product.insertMany(products);
    console.log('✅ 8 products + admin user seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
