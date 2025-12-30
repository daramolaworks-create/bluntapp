import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateBlunt } from './pages/CreateBlunt';
import { ShareBlunt } from './pages/ShareBlunt';
import { ViewBlunt } from './pages/ViewBlunt';
import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { ChatThread } from './pages/ChatThread';
import { AuthLanding } from './pages/AuthLanding';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { SplashScreen } from './components/SplashScreen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className={`transition-opacity duration-1000 ${showSplash ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateBlunt />} />
            <Route path="/share/:id" element={<ShareBlunt />} />
            <Route path="/view/:id" element={<ViewBlunt />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<ChatThread />} />
            <Route path="/auth" element={<AuthLanding />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </div>
    </AuthProvider>
  );
};

export default App;
