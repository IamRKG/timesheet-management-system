import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, addDays } from 'date-fns';
import { Layout } from '../components/layout';
import { useTimesheetStore } from '../store/timesheetStore';
import { useAuthStore } from '../store/authStore';

export function TimesheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { 
    currentTimesheet, 
    fetchTimesheet, 
    submitTimesheet,
    loading, 
    error,
    clearError,
    clearCurrentTimesheet
  } = useTimesheetStore();

  useEffect(() => {
    if (id) {
      clearError();
      fetchTimesheet(id);
    }
    
    // Cleanup
    return () => {
      clearCurrentTimesheet();
    };
  }, [id, fetchTimesheet, clearError, clearCurrentTimesheet]);

  const handleSubmitTimesheet = async () => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to submit this timesheet for approval?')) {
      return;
    }

    try {
      await submitTimesheet(id);
    } catch (err) {
      console.error('Failed to submit timesheet:', err);
    }
  };

  const formatWeekRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEE, MMM d');
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

  if (loading && !currentTimesheet) {
    return (
      <Layout title="Timesheet Details">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!currentTimesheet) {
    return (
      <Layout title="Timesheet Details">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-xl font-bold text-red-600">Timesheet not found</div>
          <Button className="mt-4 bg-navy-600 text-white hover:bg-navy-700" onClick={() => navigate('/timesheets')}>
            Back to Timesheets
          </Button>
        </div>
      </Layout>
    );
  }

  const canSubmit = currentTimesheet.status === 'draft' || currentTimesheet.status === 'rejected';
  const canAddEntries = currentTimesheet.status === 'draft' || currentTimesheet.status === 'rejected';

  return (
    <Layout title="Timesheet Details" showBackButton backUrl="/timesheets">
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-navy-700">Week: {formatWeekRange(currentTimesheet.weekStarting)}</h2>
            <div className="mt-2 flex items-center gap-2">
              {getStatusBadge(currentTimesheet.status)}
              <span className="text-sm text-gray-600">
                Total Hours: {currentTimesheet.totalHours.toFixed(1)}
              </span>
            </div>
          </div>
          {canSubmit && (
            <Button 
              className="bg-navy-600 text-white hover:bg-navy-700"
              onClick={handleSubmitTimesheet}
              disabled={loading || currentTimesheet.entries.length === 0}
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
        </div>

        {currentTimesheet.submittedAt && (
          <div className="mb-4 text-sm text-gray-600">
            Submitted: {format(new Date(currentTimesheet.submittedAt), 'MMM d, yyyy HH:mm')}
          </div>
        )}

        {currentTimesheet.approvedAt && (
          <div className="mb-4 text-sm text-gray-600">
            Approved: {format(new Date(currentTimesheet.approvedAt), 'MMM d, yyyy HH:mm')}
          </div>
        )}

        {currentTimesheet.comments && (
          <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-navy-700">Comments:</h3>
            <p className="text-sm text-gray-700">{currentTimesheet.comments}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-navy-700">Time Entries</h3>
            {canAddEntries && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-navy-600 text-navy-600 hover:bg-navy-50"
                onClick={() => navigate('/time-entries/new')}
              >
                Add Time Entry
              </Button>
            )}
          </div>

          {currentTimesheet.entries.length === 0 ? (
            <div className="mt-4 rounded-md border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No time entries yet.</p>
              {canAddEntries && (
                <Button 
                  className="mt-4 bg-navy-600 text-white hover:bg-navy-700"
                  onClick={() => navigate('/time-entries/new')}
                >
                  Add Your First Time Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTimesheet.entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.project || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {entry.startTime} - {entry.endTime || 'In Progress'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs truncate">{entry.description || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-navy-600 hover:bg-navy-50"
                          onClick={() => navigate(`/time-entries/${entry.id}`)}
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
        </div>
      </div>
    </Layout>
  );
}
