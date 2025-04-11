import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              © {currentYear} Timesheet Management System. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/dashboard" className="text-navy-600 hover:text-navy-800 text-sm">
              Dashboard
            </Link>
            <Link to="/timesheets" className="text-navy-600 hover:text-navy-800 text-sm">
              Timesheets
            </Link>
            <Link to="/help" className="text-navy-600 hover:text-navy-800 text-sm">
              Help
            </Link>
            <Link to="/privacy" className="text-navy-600 hover:text-navy-800 text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
