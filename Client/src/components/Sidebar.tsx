import type { FC, Dispatch } from 'react';
import { Wallet, Home, TrendingUp, CreditCard, Target, PiggyBank, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import type { AppState, AppAction } from '../types/budget';
import { useAuth } from '../AuthContext';

interface SidebarProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const Sidebar: FC<SidebarProps> = ({ state, dispatch, isCollapsed, setIsCollapsed }) => {
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: Home },
    { view: 'accounts', label: 'Wallet', icon: Wallet },
    { view: 'transactions', label: 'Transactions', icon: TrendingUp },
    { view: 'expenses', label: 'Expenses', icon: CreditCard },
    { view: 'categories', label: 'Categories', icon: FolderOpen },
    { view: 'budgets', label: 'Budgets', icon: Target },
    { view: 'goals', label: 'Goals', icon: PiggyBank },
    { view: 'reports', label: 'Reports', icon: BarChart3 },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center h-16 border-b border-gray-200 px-4">
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <Wallet size={24} className="text-blue-600" />
          {!isCollapsed && <h1 className="text-xl font-bold text-gray-900 ml-2">FinanceApp</h1>}
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              state.currentView === item.view
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-gray-200">
        <button 
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
      <div className="px-4 py-6 border-t border-gray-200">
        <button onClick={toggleSidebar} className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};