import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Bookmark, 
  Grid3X3,
  HelpCircle,
  MessageSquare,
  User,
  Menu,
  X,
  Gift,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, currentView, onViewChange }) => {
  const menuItems = [
    { id: 'discover', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'categories', label: 'Categorias', icon: Grid3X3 },
    { id: 'discounts', label: 'Descontos', icon: Gift },
    { id: 'affiliates', label: 'Afiliados', icon: DollarSign },
    { id: 'request-lesson', label: 'Pedir Aula', icon: MessageSquare },
  ];

  const SidebarLink = ({ item }: { item: any }) => (
    <button
      onClick={() => onViewChange(item.id)}
      className={`group relative flex items-center w-full transition-all duration-200 ${
        collapsed 
          ? 'w-12 h-12 justify-center rounded-lg mx-auto flex-shrink-0' 
          : 'p-4 rounded-xl'
      } ${
        currentView === item.id
          ? 'bg-[#ff7551] text-white shadow-lg'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
      }`}
    >
      {/* Icon */}
      <div className={`flex items-center justify-center transition-all duration-200 ${
        collapsed ? 'w-full h-full' : 'mr-4'
      }`}>
        <item.icon className={`transition-all duration-200 ${collapsed ? 'w-5 h-5' : 'w-6 h-6'}`} />
      </div>
      
      {/* Label */}
      {!collapsed && (
        <span className="font-medium text-base transition-all duration-200">
          {item.label}
        </span>
      )}
      
      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-[5px] border-b-[5px] border-r-[5px] border-transparent border-r-slate-800" />
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={onToggle}
        />
      )}
      
      <aside className={`h-full transition-all duration-300 z-30 flex flex-col ${
        collapsed ? 'w-0 lg:w-14' : 'w-64 lg:w-64'
      } ${
        collapsed 
          ? 'lg:relative fixed left-0 top-0 overflow-hidden lg:w-16' 
          : 'lg:relative fixed left-0 top-0 overflow-y-auto'
      } border-r border-slate-700/20`}>
        
        {/* Header with Hamburger Menu */}
        <div className={`${collapsed ? 'p-3' : 'p-5'} border-b border-slate-700/20 flex-shrink-0 flex items-center justify-center`}>
          {/* Hamburger Menu Button */}
          <button
            onClick={onToggle}
            className={`${collapsed ? 'p-2' : 'p-3'} rounded-lg hover:bg-slate-700/30 transition-colors group`}
          >
            {/* Mobile: Show X when expanded, Menu when collapsed */}
            <div className="lg:hidden">
              {collapsed ? (
                <Menu className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              ) : (
                <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              )}
            </div>
            
            {/* Desktop: Always show Menu icon */}
            <div className="hidden lg:block">
              <Menu className={`${collapsed ? 'w-5 h-5' : 'w-6 h-6'} text-slate-400 group-hover:text-white transition-colors`} />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className={`flex-1 ${collapsed ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide'}`}>
          <div className={`${collapsed ? 'p-3' : 'p-6'} transition-all duration-300`}>
            <div className={`${collapsed ? 'space-y-4 flex flex-col items-center' : 'space-y-3'}`}>
              {menuItems.map((item) => (
                <SidebarLink key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;