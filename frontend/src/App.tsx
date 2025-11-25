import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import Landing from './pages/Landing';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Streaming from './pages/Streaming';
import AdminPanel from './pages/AdminPanel';
import CreateStream from './pages/CreateStream';
import CreateGroup from './pages/CreateGroup';
import './index.css';

function App() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchUser();
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [fetchUser, theme]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0a0e12] to-[#121820]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#e9edef] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/chat/:roomId" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/chat/create-group" element={isAuthenticated ? <CreateGroup /> : <Navigate to="/login" />} />
        <Route path="/streaming" element={isAuthenticated ? <Streaming /> : <Navigate to="/login" />} />
        <Route path="/streaming/create" element={isAuthenticated ? <CreateStream /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
