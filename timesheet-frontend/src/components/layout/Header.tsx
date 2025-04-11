import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function Header({ title = 'Timesheet Management', showBackButton = false, backUrl = '/dashboard' }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-navy-700 p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={() => navigate(backUrl)}
              className="mr-2 rounded-full p-1 hover:bg-navy-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">
              {user.firstName} {user.lastName}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-white text-white hover:bg-navy-600"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
