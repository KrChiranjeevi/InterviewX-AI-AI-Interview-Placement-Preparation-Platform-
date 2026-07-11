import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-6 flex items-start justify-between relative overflow-hidden group"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
      
      <div>
        <p className="text-slate-400 font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      
      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl border border-indigo-500/30">
        {icon}
      </div>
    </motion.div>
  );
};

export default StatCard;
