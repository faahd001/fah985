import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EngineersList from './pages/EngineersList';
import EngineerProfile from './pages/EngineerProfile';
import About from './pages/About';
import JobBoard from './pages/JobBoard';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/engineers" element={<EngineersList />} />
            <Route path="/engineers/:id" element={<EngineerProfile />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/jobs/new" element={<PostJob />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<div className="p-10 text-center text-xl text-gray-500">Not Found</div>} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}
