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

export const HeaderNew: FC<HeaderNewProps> = ({ 
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
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
            >
              <img 
                className="h-8 w-8 rounded-full" 
                src={`https://i.pravatar.cc/150?u=${currentUser?.email || 'default'}`} 
                alt="User"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500">{currentSpace?.name || 'Loading...'}</p>
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