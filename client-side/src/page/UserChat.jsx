import Chat from '../components/Chat';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserChat() {
  const { user } = useAuth();
  const [partnerEmail] = useState('Admin Support');
  const title = 'Support Chat';

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <Chat 
        partnerEmail={partnerEmail} 
        title={title}
      />
    </div>
  );
}

