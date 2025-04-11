import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, addDays, startOfWeek } from 'date-fns';
import { Layout } from '../components/layout';
import { useTimesheetStore } from '../store/timesheetStore';

export function Timesheets() {
  const navigate = useNavigate();
  
  const { 
    timesheets, 
    fetchMyTimesheets, 
    createTimesheet,
    loading, 
    error,
    clearError
  } = useTimesheetStore();

  useEffect(() => {
    clearError();
    fetchMyTimesheets();
  }, [fetchMyTimesheets, clearError]);

  const handleCreateTimesheet = async () => {
    // Create a timesheet for the current week
    const weekStarting = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    try {
      const newTimesheet = await createTimesheet(weekStarting);
      navigate(`/timesheets/${newTimesheet.id}`);
    } catch (err) {
      console.error('Failed to create timesheet:', err);
    }
  };

  const formatWeekRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">Draft</span>;
      case 'submitted':
        return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Submitted</span>;
      case 'approved':
        return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Approved</span>;
      case 'rejected':
        return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">Rejected</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">{status}</span>;
    }
  };

  return (
    <Layout title="My Timesheets">
      <div className="mb-4 flex justify-between">
        <div></div>
        <Button 
          className="bg-navy-600 text-white hover:bg-navy-700"
          onClick={handleCreateTimesheet}
        >
          New Timesheet
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && timesheets.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent"></div>
        </div>
      ) : timesheets.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">You don't have any timesheets yet.</p>
          <Button 
            className="mt-4 bg-navy-600 text-white hover:bg-navy-700"
            onClick={handleCreateTimesheet}
          >
            Create Your First Timesheet
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Week</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Total Hours</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Submitted</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Approved</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((timesheet) => (
                <tr key={timesheet.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700">{formatWeekRange(timesheet.weekStarting)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getStatusBadge(timesheet.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{timesheet.totalHours.toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {timesheet.submittedAt ? format(new Date(timesheet.submittedAt), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {timesheet.approvedAt ? format(new Date(timesheet.approvedAt), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-navy-600 hover:bg-navy-50"
                      onClick={() => navigate(`/timesheets/${timesheet.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
