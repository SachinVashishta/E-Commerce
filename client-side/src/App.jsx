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
import UserChat from './page/UserChat';
import AdminChat from './page/AdminChat';
import AIChat from './page/AIChat';
import Chat from './components/Chat';

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
              <Route path="/chat" element={<UserChat />} />
            <Route path="/chat1" element={<Chat />} />
              <Route path="/admin-chat/:userId" element={<AdminChat />} />
              <Route path="/ai" element={<AIChat />} />



            </Routes>
          </div>
        </Router>
      </CardProvider>
    </AuthProvider>
  );
}

export default App;
