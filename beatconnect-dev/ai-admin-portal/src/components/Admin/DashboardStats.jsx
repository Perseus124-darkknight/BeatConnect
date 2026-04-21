import React, { useMemo } from 'react';
import { Activity, Users, Shield, Cpu } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, color = 'primary', delay = 0 }) => (
  <div 
    className="glass-card-premium p-6 rounded-[32px] border border-white/5 flex flex-col gap-4 animate-fadeInFast relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}/10 rounded-full blur-2xl group-hover:bg-${color}/20 transition-colors`} />
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`w-12 h-12 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color}`}>
        <Icon size={22} />
      </div>
      <div className="flex flex-col items-end">
        <span className="text-white/20 text-[10px] font-mono uppercase tracking-widest">{label}</span>
        <span className="text-white font-display text-4xl italic font-black tracking-tighter leading-none mt-1">{value}</span>
      </div>
    </div>
    
    <div className="relative z-10 mt-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{subtext}</span>
        <span className={`text-[10px] font-mono text-${color} uppercase tracking-tighter`}>Optimal</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color} rounded-full animate-progress`} 
          style={{ width: '65%', animationDuration: '2s' }} 
        />
      </div>
    </div>
  </div>
);

const DashboardStats = ({ artistCount }) => {
  const stats = useMemo(() => [
    { icon: Users, label: 'Identity Nodes', value: artistCount, subtext: 'Active Roster', color: 'primary' },
    { icon: Activity, label: 'Auth Traffic', value: '4.2k', subtext: 'Req / Second', color: 'secondary' },
    { icon: Shield, label: 'Security Level', value: 'A+', subtext: 'Protocol 09-X', color: 'emerald-400' },
    { icon: Cpu, label: 'Core Load', value: '14%', subtext: 'Neural Engine', color: 'blue-400' }
  ], [artistCount]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i * 100} />
      ))}
    </div>
  );
};

export default DashboardStats;
