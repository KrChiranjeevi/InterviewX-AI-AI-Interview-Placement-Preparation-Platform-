import { useContext } from 'react';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = ({ title, subtitle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-white">{title || `Welcome Back ${user?.name?.split(' ')[0] || ''} 👋`}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-6 relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative text-slate-400 hover:text-white transition-colors"
        >
          <FaBell className="text-xl" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-10 right-20 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-white font-bold">Notifications</h3>
              <span className="text-xs text-indigo-400 cursor-pointer">Mark all read</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {/* Dummy Notifications */}
              <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <p className="text-sm text-slate-200">Your AI report for <strong>Frontend Engineer</strong> is ready!</p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
              <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <p className="text-sm text-slate-200">You earned a new badge: <strong>Fast Learner</strong> 🏆</p>
                <p className="text-xs text-slate-500 mt-1">1 day ago</p>
              </div>
              <div className="p-4 hover:bg-slate-800/30 transition-colors">
                <p className="text-sm text-slate-200">John Doe replied to your community post.</p>
                <p className="text-xs text-slate-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-3 border-l border-slate-700 pl-6">
          <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
            ) : (
              <FaUserCircle className="text-3xl text-indigo-400" />
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">Pro Plan</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="ml-4 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
            <FaSignOutAlt className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
