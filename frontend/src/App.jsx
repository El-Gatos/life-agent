import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Deadlines from './pages/Deadlines';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Redirect the root URL straight to the dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Your actual pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;