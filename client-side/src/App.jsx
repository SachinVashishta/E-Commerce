import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './page/Home';
import { AuthProvider } from './context/AuthContext';
import { CardProvider } from './context/CardContext';
import ProductDetails from './page/ProductDetails';
import Cart from './page/Cart';
import Login from './page/Login';
import Profile from './page/Profile';
import AdminPanel from './page/AdminPanel';
function App() {
  return (
    <AuthProvider>
      <CardProvider>
        <Router>
          <div className="App">
            <Nav />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/admin-chat" element={<AdminChat />} />
            </Routes>
          </div>
        </Router>
      </CardProvider>
    </AuthProvider>
  );
}

export default App;
