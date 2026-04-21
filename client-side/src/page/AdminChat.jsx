import Chat from '../components/Chat';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminChat() {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const { user } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' && targetUserId) {
      axios.get(`${API_URL}/api/users/${targetUserId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => setPartnerEmail(res.data.email))
        .catch(() => setPartnerEmail('Unknown User'));
    }
  }, [targetUserId, user]);

  const title = 'Admin - Live Chat';

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <Chat 
        targetUserId={targetUserId} 
        partnerEmail={partnerEmail} 
        title={title}
      />
    </div>
  );
}

