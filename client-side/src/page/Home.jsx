import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
const API_URL = import.meta.env.VITE_API_URL;

    const fetchProducts = async () => {
      try {
        const params = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (searchParams.get('search')) params.search = searchParams.get('search');
        const res = await axios.get(`${API_URL}/api/products`, { params });
        setProducts(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchParams]);


  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="home">
      <h1>All Products</h1>
      <div className="categories">
        <button 
          className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All
        </button>
        <button 
          className={`category-btn ${selectedCategory === 'Electronics' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('Electronics')}
        >
          Electronics
        </button>
        <button 
          className={`category-btn ${selectedCategory === 'Clothing' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('Clothing')}
        >
          Clothing
        </button>
        <button 
          className={`category-btn ${selectedCategory === 'Books' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('Books')}
        >
          Books
        </button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;