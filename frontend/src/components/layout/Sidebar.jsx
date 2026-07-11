import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, FaMicrophone, FaFileAlt, FaCode, 
  FaBuilding, FaChartLine, FaMapSigns, FaUsers, FaCog 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/interview/setup', icon: <FaMicrophone />, label: 'Start Interview' },
    { path: '/resume', icon: <FaFileAlt />, label: 'Resume Analyzer' },
    { path: '/coding', icon: <FaCode />, label: 'Coding Round' },
    { path: '/companies', icon: <FaBuilding />, label: 'Company Prep' },
    { path: '/reports', icon: <FaChartLine />, label: 'Reports' },
    { path: '/roadmap', icon: <FaMapSigns />, label: 'Roadmap' },
    { path: '/community', icon: <FaUsers />, label: 'Community' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center">
        <h1 className="text-2xl font-bold gradient-text tracking-tight">InterviewX AI 🚀</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={idx} 
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(79,70,229,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={`mr-3 text-lg ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
