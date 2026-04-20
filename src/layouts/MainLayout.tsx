import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      if (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user') {
        console.log('Login popup ignored or closed by user.');
      } else {
        console.error('Login error:', e);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="h-[70px] bg-white border-b border-[#e2e8f0] flex-shrink-0 z-50 relative">
      <div className="w-full h-full px-10 flex items-center justify-between mx-auto">
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0 flex items-center text-primary text-2xl font-extrabold tracking-tight">
            Pro<span className="text-[#0f172a]">Finder</span>
          </Link>
          <div className="hidden sm:ml-12 sm:flex sm:space-x-8">
            <Link to="/engineers" className="text-[#64748b] hover:text-primary inline-flex items-center text-sm font-medium transition-colors">Discover Engineers</Link>
            <Link to="/jobs" className="text-[#64748b] hover:text-primary inline-flex items-center text-sm font-medium transition-colors">Job Board</Link>
            <Link to="/about" className="text-[#64748b] hover:text-primary inline-flex items-center text-sm font-medium transition-colors">About</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="geo-btn bg-transparent border border-[#e2e8f0] text-[#0f172a] hover:bg-gray-50 flex items-center">Dashboard</Link>
              <div className="flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-[#e2e8f0]">
                    <UserIcon size={16} />
                  </div>
                )}
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="geo-btn border border-[#e2e8f0] bg-transparent text-[#0f172a] hover:bg-gray-50">
                Login
              </button>
              <button onClick={handleLogin} className="geo-btn bg-primary text-white hover:bg-primary-dark">
                Join ProFinder
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} ProFinder. Connecting Skills to Solutions.</p>
      </footer>
    </div>
  );
};
