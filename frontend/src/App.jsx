import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Dashboard from './pages/Dashboard';
import Deadlines from './pages/Deadlines';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';

function LayoutWrapper({ children }) {
  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="flex">
          <div className="flex-1">{children}</div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
        <Route path="/deadlines" element={<LayoutWrapper><Deadlines /></LayoutWrapper>} />
        <Route path="/tasks" element={<LayoutWrapper><Tasks /></LayoutWrapper>} />
        <Route path="/settings" element={<LayoutWrapper><Settings /></LayoutWrapper>} />
      </Routes>
    </BrowserRouter>
  );
}