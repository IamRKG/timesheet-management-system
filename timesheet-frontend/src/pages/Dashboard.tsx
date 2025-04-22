import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTimesheetStore } from '../store/timesheetStore';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout';
import { StatusBadge } from '../components/ui/status-badge';
import { Spinner } from '../components/ui/spinner';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

export function Dashboard() {
  const { token, user } = useAuthStore();
  const { 
    timesheets, 
    fetchMyTimesheets, 
    pendingApprovals, 
    fetchPendingApprovals,
    loading 
  } = useTimesheetStore();
  const navigate = useNavigate();
  const [recentTimesheets, setRecentTimesheets] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentWeekTimesheet, setCurrentWeekTimesheet] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch recent timesheets
    fetchMyTimesheets();
    
    // If manager, fetch pending approvals
    if (user?.role === 'manager' || user?.role === 'admin') {
      fetchPendingApprovals();
    }
  }, [token, navigate, user, fetchMyTimesheets, fetchPendingApprovals]);

  useEffect(() => {
    // Get the 3 most recent timesheets
    if (timesheets.length > 0) {
      setRecentTimesheets(timesheets.slice(0, 3));
      
      // Check if there's a timesheet for the current week
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const currentWeekTimesheet = timesheets.find(ts => {
        const tsDate = new Date(ts.weekStarting);
        return tsDate.getTime() === currentWeekStart.getTime();
      });
      
      setCurrentWeekTimesheet(currentWeekTimesheet);
    }
    
    // Set pending count
    if (pendingApprovals.length > 0) {
      setPendingCount(pendingApprovals.length);
    }
  }, [timesheets, pendingApprovals]);

  const formatWeekRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const handleCreateTimesheet = async () => {
    // Create a timesheet for the current week
    const weekStarting = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    navigate(`/timesheets/new?weekStarting=${weekStarting}`);
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <Layout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-700">Welcome, {user?.firstName}!</h2>
        <p className="mt-2 text-gray-600">
          {isManager 
            ? 'Manage your team\'s timesheets and approve time entries.' 
            : 'Track your time and submit timesheets for approval.'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner label="Loading your dashboard..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Week Card */}
          <div className="card">
            <h3 className="text-lg font-medium text-navy-700">Current Week</h3>
            <p className="mt-1 text-sm text-gray-600">
              {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </p>
            
            {currentWeekTimesheet ? (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={currentWeekTimesheet.status} />
                  <span className="text-sm font-medium">
                    {currentWeekTimesheet.totalHours.toFixed(1)} hours
                  </span>
                </div>
                <Button 
                  className="mt-4 w-full btn-primary" 
                  onClick={() => navigate(`/timesheets/${currentWeekTimesheet.id}`)}
                >
                  View Timesheet
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-600">No timesheet created for this week yet.</p>
                <Button 
                  className="mt-4 w-full btn-primary" 
                  onClick={handleCreateTimesheet}
                >
                  Create Timesheet
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card">
            <h3 className="text-lg font-medium text-navy-700">Quick Actions</h3>
            <div className="mt-4 space-y-3">
              <Button 
                className="w-full justify-start btn-secondary" 
                onClick={() => navigate('/time-entries/new')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Log Time Entry
              </Button>
              <Button 
                className="w-full justify-start btn-secondary" 
                onClick={() => navigate('/timesheets')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Timesheets
              </Button>
              <Button 
                className="w-full justify-start btn-secondary" 
                onClick={() => navigate('/profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Button>
            </div>
          </div>

          {/* Manager Approvals or Recent Timesheets */}
          {isManager ? (
            <div className="card">
              <h3 className="text-lg font-medium text-navy-700">Pending Approvals</h3>
              {pendingCount > 0 ? (
                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{pendingCount} timesheet(s) pending approval</span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-xs font-medium text-accent-800">
                      {pendingCount}
                    </span>
                  </div>
                  <Button 
                    className="w-full btn-primary" 
                    onClick={() => navigate('/pending-approvals')}
                  >
                    Review Approvals
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">No timesheets pending approval.</p>
                  <Button 
                    className="mt-4 w-full btn-secondary" 
                    onClick={() => navigate('/pending-approvals')}
                  >
                    View Approvals
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 className="text-lg font-medium text-navy-700">Recent Timesheets</h3>
              {recentTimesheets.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {recentTimesheets.map((timesheet) => (
                    <div 
                      key={timesheet.id} 
                      className="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                      onClick={() => navigate(`/timesheets/${timesheet.id}`)}
                    >
                      <div>
                        <p className="font-medium">{formatWeekRange(timesheet.weekStarting)}</p>
                        <p className="text-sm text-gray-600">{timesheet.totalHours.toFixed(1)} hours</p>
                      </div>
                      <StatusBadge status={timesheet.status} />
                    </div>
                  ))}
                  <Button 
                    className="w-full btn-secondary" 
                    onClick={() => navigate('/timesheets')}
                  >
                    View All
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">No recent timesheets found.</p>
                  <Button 
                    className="mt-4 w-full btn-primary" 
                    onClick={handleCreateTimesheet}
                  >
                    Create Your First Timesheet
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );}