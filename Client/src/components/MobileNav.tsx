import type { FC, Dispatch } from 'react';
import { Home, Wallet, Target, PiggyBank, Plus } from 'lucide-react';
import type { AppState, AppAction } from '../types/budget';

interface MobileNavProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  onAddClick: () => void;
}

export const MobileNav: FC<MobileNavProps> = ({ state, dispatch, onAddClick }) => {
  const navItems = [
    { view: 'dashboard', label: 'Home', icon: Home },
    { view: 'accounts', label: 'Wallet', icon: Wallet },
    { view: 'budgets', label: 'Budgets', icon: Target },
    { view: 'goals', label: 'Goals', icon: PiggyBank },
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center">
        {navItems.slice(0, 2).map(item => (
            <button key={item.view} onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })} className={`flex-1 flex flex-col items-center py-2 ${state.currentView === item.view ? 'text-blue-600' : 'text-gray-600'}`}>
                <item.icon size={22} />
                <span className="text-xs mt-1">{item.label}</span>
            </button>
        ))}
        
        <button onClick={onAddClick} className="p-4 -mt-6 bg-blue-600 text-white rounded-full shadow-lg">
          <Plus size={24} />
        </button>

        {navItems.slice(2, 4).map(item => (
            <button key={item.view} onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })} className={`flex-1 flex flex-col items-center py-2 ${state.currentView === item.view ? 'text-blue-600' : 'text-gray-600'}`}>
                <item.icon size={22} />
                <span className="text-xs mt-1">{item.label}</span>
            </button>
        ))}
      </div>
    </div>
  );
};