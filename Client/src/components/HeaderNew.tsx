import { type FC, type Dispatch, type SetStateAction } from 'react';
import { Menu, Eye, EyeOff, Bell } from 'lucide-react';
import { useSpace } from '../contexts/SpaceContext';
import { SpaceSelector } from './SpaceSelector';

interface HeaderNewProps {
  currentView: string;
  showBalances: boolean;
  onToggleBalances: () => void;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const HeaderNew: FC<HeaderNewProps> = ({ 
  currentView, 
  showBalances, 
  onToggleBalances, 
  setSidebarOpen 
}) => {
  const { currentUser, currentSpace } = useSpace();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">{currentView}</h2>
          <SpaceSelector />
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleBalances}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            {showBalances ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="flex items-center space-x-2">
            <img 
              className="h-8 w-8 rounded-full" 
              src={`https://i.pravatar.cc/150?u=${currentUser?.email || 'default'}`} 
              alt="User"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
              </p>
              <p className="text-xs text-gray-500">{currentSpace?.name || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};