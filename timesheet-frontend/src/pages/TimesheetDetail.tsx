import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, addDays, parseISO } from 'date-fns';
import { Layout } from '../components/layout';
import { StatusBadge } from '../components/ui/status-badge';
import { Spinner } from '../components/ui/spinner';
import { Alert } from '../components/ui/alert';
import { useTimesheetStore } from '../store/timesheetStore';
import { useAuthStore } from '../store/authStore';

export function TimesheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuthStore();
  
  const { 
    currentTimesheet, 
    fetchTimesheet, 
    submitTimesheet,
    loading, 
    error,
    clearError,
    clearCurrentTimesheet
  } = useTimesheetStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

    setIsSubmitting(true);
    try {
      await submitTimesheet(id);
      setSuccessMessage('Timesheet submitted successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to submit timesheet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWeekRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'EEE, MMM d');
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    
    return `${wholeHours}h ${minutes}m`;
  };

  if (loading && !currentTimesheet) {
    return (
      <Layout title="Timesheet Details" showBackButton backUrl="/timesheets">
        <div className="flex justify-center py-12">
          <Spinner label="Loading timesheet details..." />
        </div>
      </Layout>
    );
  }

  if (!currentTimesheet) {
    return (
      <Layout title="Timesheet Details" showBackButton backUrl="/timesheets">
        <Alert variant="error" className="mb-6">
          Timesheet not found. It may have been deleted or you don't have permission to view it.
        </Alert>
        <div className="flex justify-center">
          <Button className="btn-primary" onClick={() => navigate('/timesheets')}>
            Back to Timesheets
          </Button>
        </div>
      </Layout>
    );
  }

  const canSubmit = currentTimesheet.status === 'draft' || currentTimesheet.status === 'rejected';
  const canAddEntries = currentTimesheet.status === 'draft' || currentTimesheet.status === 'rejected';
  
  const renderTimesheetActions = canSubmit && (
    <Button 
      className="btn-primary"
      onClick={handleSubmitTimesheet}
      disabled={isSubmitting || currentTimesheet.entries.length === 0}
    >
      {isSubmitting ? (
        <>
          <Spinner size="sm" variant="white" className="mr-2" />
          Submitting...
        </>
      ) : (
        'Submit for Approval'
      )}
    </Button>
  );

  return (
    <Layout 
      title="Timesheet Details" 
      showBackButton 
      backUrl="/timesheets"
      actions={renderTimesheetActions}
    >
      {error && (
        <Alert 
          variant="error" 
          className="mb-6"
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          variant="success" 
          className="mb-6"
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      <div className="card mb-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-navy-700">
              Week: {formatWeekRange(currentTimesheet.weekStarting)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge status={currentTimesheet.status} />
              <span className="text-sm text-gray-600">
                Total Hours: {formatDuration(currentTimesheet.totalHours)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-md bg-gray-50 p-4">
          {currentTimesheet.submittedAt && (
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submitted: {format(parseISO(currentTimesheet.submittedAt), 'MMM d, yyyy HH:mm')}
            </div>
          )}

          {currentTimesheet.approvedAt && (
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approved: {format(parseISO(currentTimesheet.approvedAt), 'MMM d, yyyy HH:mm')}
            </div>
          )}

          {currentTimesheet.comments && (
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-medium text-navy-700">Manager Comments:</h3>
              <p className="text-sm text-gray-700">{currentTimesheet.comments}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-navy-700">Time Entries</h3>
          {canAddEntries && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-navy-600 text-navy-600 hover:bg-navy-50"
              onClick={() => navigate(`/time-entries/new?timesheetId=${currentTimesheet.id}`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Time Entry
            </Button>
          )}
        </div>

        {currentTimesheet.entries.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No time entries yet.</p>
            {canAddEntries && (
              <Button 
                className="mt-4 btn-primary"
                onClick={() => navigate(`/time-entries/new?timesheetId=${currentTimesheet.id}`)}
              >
                Add Your First Time Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTimesheet.entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.project || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.startTime} - {entry.endTime || 'In Progress'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.duration ? formatDuration(entry.duration) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="max-w-xs truncate">{entry.description || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-navy-600 hover:bg-navy-50"
                          onClick={() => navigate(`/time-entries/${entry.id}`)}
                        >
                          View
                        </Button>
                        {canAddEntries && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-navy-600 hover:bg-navy-50"
                            onClick={() => navigate(`/time-entries/edit/${entry.id}`)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}