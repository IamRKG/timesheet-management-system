import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">About</h3>
            <div className="mt-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-bold text-navy-700">Timesheet Management</span>
              </div>
              <p className="mt-2 text-base text-gray-600">
                A comprehensive solution for tracking work hours, managing timesheets, and streamlining the approval process.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/dashboard" className="text-base text-gray-600 hover:text-navy-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/timesheets" className="text-base text-gray-600 hover:text-navy-600">
                  Timesheets
                </Link>
              </li>
              <li>
                <Link to="/time-entries/new" className="text-base text-gray-600 hover:text-navy-600">
                  Log Time
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-base text-gray-600 hover:text-navy-600">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Help & Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-navy-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-navy-600">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-navy-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-navy-600">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-gray-500">
            © {currentYear} Timesheet Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}