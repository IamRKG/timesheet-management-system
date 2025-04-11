import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout';

export function Dashboard() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!user) {
    return null;
  }

  const isManager = user.role === 'manager' || user.role === 'admin';

  return (
    <Layout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-700">Welcome, {user.firstName}!</h2>
        <p className="mt-2 text-gray-600">
          {isManager 
            ? 'Manage your team\'s timesheets and approve time entries.' 
            : 'Track your time and submit timesheets for approval.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-navy-700">My Timesheets</h3>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your weekly timesheets
          </p>
          <Button 
            className="mt-4 bg-navy-600 text-white hover:bg-navy-700" 
            onClick={() => navigate('/timesheets')}
          >
            View Timesheets
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-navy-700">Time Entries</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add new time entries for your work
          </p>
          <Button 
            className="mt-4 bg-navy-600 text-white hover:bg-navy-700" 
            onClick={() => navigate('/time-entries/new')}
          >
            Add Time Entry
          </Button>
        </div>

        {isManager && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-navy-700">Pending Approvals</h3>
            <p className="mt-2 text-sm text-gray-600">
              Review and approve team timesheets
            </p>
            <Button 
              className="mt-4 bg-navy-600 text-white hover:bg-navy-700" 
              onClick={() => navigate('/pending-approvals')}
            >
              View Approvals
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
