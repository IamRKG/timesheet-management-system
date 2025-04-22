import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <header className="bg-navy-700 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {showBackButton && (
              <button 
                onClick={handleBack}
                className="mr-2 rounded-full p-1 text-white hover:bg-navy-600"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Link to="/dashboard" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-navy-600 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          )}
          
          {/* Desktop navigation */}
          {user && (
            <div className="hidden md:flex md:items-center md:space-x-4">
              <nav className="flex items-center space-x-4">
                <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-navy-600">
                  Dashboard
                </Link>
                <Link to="/timesheets" className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-navy-600">
                  Timesheets
                </Link>
                {isManager && (
                  <Link to="/pending-approvals" className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-navy-600">
                    Approvals
                  </Link>
                )}
              </nav>
              
              <div className="ml-4 flex items-center">
                <div className="relative">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center rounded-full bg-navy-600 p-1 text-white hover:bg-navy-500 focus:outline-none"
                  >
                    <span className="sr-only">View profile</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-500 text-sm font-medium uppercase">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  </button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ml-4 border-white text-white hover:bg-navy-600"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {user && mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link 
              to="/dashboard" 
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/timesheets" 
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Timesheets
            </Link>
            {isManager && (
              <Link 
                to="/pending-approvals" 
                className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Approvals
              </Link>
            )}
            <Link 
              to="/profile" 
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-white hover:bg-navy-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}