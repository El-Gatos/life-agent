import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          <div className="flex-1">{children}</div>
          
          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}