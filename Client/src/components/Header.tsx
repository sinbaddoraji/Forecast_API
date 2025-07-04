import { type FC, type Dispatch, type SetStateAction, useState } from 'react';
import { Menu, Eye, EyeOff, Bell, User, Settings, BarChart3 } from 'lucide-react';
import { useSpace } from '../contexts/SpaceContext';
import { SpaceSelector } from './SpaceSelector';
import UserProfile from './UserProfile';
import SpaceManagement from './SpaceManagement';
import UserActivity from './UserActivity';

interface HeaderNewProps {
  currentView: string;
  showBalances: boolean;
  onToggleBalances: () => void;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const Header: FC<HeaderProps> = ({ 
  currentView, 
  showBalances, 
  onToggleBalances, 
  setSidebarOpen 
}) => {
  const { currentUser, currentSpace } = useSpace();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);
  const [showUserActivity, setShowUserActivity] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center min-h-[4rem] px-3 sm:px-4 md:px-6 py-2">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600 mr-2 flex-shrink-0">
          <Menu size={24} />
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0">
          <h2 className="hidden sm:block text-base sm:text-lg font-semibold text-gray-800 capitalize mb-1 sm:mb-0 sm:mr-3">{currentView}</h2>
          <div className="w-full sm:w-auto">
            <SpaceSelector />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-auto flex-shrink-0">
          <button
            onClick={onToggleBalances}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            {showBalances ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
          </button>
          <button className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 relative">
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 sm:p-2"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  className="h-full w-full object-cover" 
                  src={`https://i.pravatar.cc/150?u=${currentUser?.email || 'default'}`} 
                  alt="User"
                />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentSpace?.name || 'Loading...'}</p>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <button
                  onClick={() => {
                    setShowUserProfile(true);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowSpaceManagement(true);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Manage Spaces
                </button>
                <button
                  onClick={() => {
                    setShowUserActivity(true);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Activity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal Components */}
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
      
      {showSpaceManagement && (
        <SpaceManagement onClose={() => setShowSpaceManagement(false)} />
      )}
      
      {showUserActivity && (
        <UserActivity onClose={() => setShowUserActivity(false)} />
      )}
    </header>
  );
};