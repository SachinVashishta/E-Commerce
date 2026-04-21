import React, { useState } from 'react';
import './Nav.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CardContext';
import { useAuth } from '../context/AuthContext';

const Nav = () => {
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = search.trim();
    if (searchTerm) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">🛒</Link>
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              const term = e.target.value.trim();
              if (term) {
                navigate(`/?search=${encodeURIComponent(term)}`);
              } else {
                navigate('/');
              }
            }}
          />
        </div>
        
        <div className="nav-links">
          <Link to="/">🏠 Home</Link>
          
        {user ? (
            <>
              <Link to="/chat">💬 Chat</Link>
              <Link to="/profile">👤 Profile</Link>
              {user.role === 'admin' && <Link to="/admin">⚙️ Admin</Link>}
            </>
          ) : (
            <Link to="/login">🔐 Login</Link>
          )}
          
          <Link to="/cart" className="cart-link">
            🛒 Cart <span className="cart-badge">{cartItemCount}</span>
          </Link>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={closeMenu}>🏠 Home</Link>
        
        {user ? (
          <>
            <Link to="/profile" onClick={closeMenu}>👤 Profile</Link>
            <Link to="/chat1" onClick={closeMenu}>💬 Chat</Link>
            {user.role === 'admin' && <Link to="/admin" onClick={closeMenu}>⚙️ Admin</Link>}

          </>
        ) : (
          <Link to="/login" onClick={closeMenu}>🔐 Login</Link>
        )}
        
        <Link to="/cart" onClick={closeMenu} className="cart-link">
          🛒 Cart <span className="cart-badge">{cartItemCount}</span>
        </Link>
      </div>
    </>
  );
};

export default Nav;