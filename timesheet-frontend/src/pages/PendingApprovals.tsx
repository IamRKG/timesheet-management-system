import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, addDays, parseISO } from 'date-fns';
import { Layout } from '../components/layout';
import { StatusBadge } from '../components/ui/status-badge';
import { Spinner } from '../components/ui/spinner';
import { Alert } from '../components/ui/alert';
import { useTimesheetStore } from '../store/timesheetStore';

export function PendingApprovals() {
  const navigate = useNavigate();
  
  const { 
    pendingApprovals, 
    fetchPendingApprovals, 
    approveTimesheet,
    rejectTimesheet,
    loading, 
    error,
    clearError
  } = useTimesheetStore();
  
  const [rejectComments, setRejectComments] = useState<{[key: string]: string}>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    clearError();
    fetchPendingApprovals();
  }, [fetchPendingApprovals, clearError]);

  const formatWeekRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    
    return `${wholeHours}h ${minutes}m`;
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this timesheet?')) {
      return;
    }
    
    setProcessingId(id);
    try {
      await approveTimesheet(id);
      setSuccessMessage('Timesheet approved successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to approve timesheet:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const comments = rejectComments[id]?.trim();
    
    if (!comments) {
      alert('Please provide comments explaining why the timesheet is being rejected.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to reject this timesheet?')) {
      return;
    }
    
    setProcessingId(id);
    try {
      await rejectTimesheet(id, comments);
      setSuccessMessage('Timesheet rejected successfully!');
      
      // Clear the comments for this timesheet
      setRejectComments(prev => {
        const updated = {...prev};
        delete updated[id];
        return updated;
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to reject timesheet:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCommentChange = (id: string, value: string) => {
    setRejectComments(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Layout title="Pending Approvals" showBackButton backUrl="/dashboard">
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

      {loading && pendingApprovals.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner label="Loading pending approvals..." />
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="card p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-2 text-gray-600">There are no timesheets pending approval.</p>
          <Button 
            className="mt-6 btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.map((timesheet) => (
            <div key={timesheet.id} className="card">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-navy-700">
                    Week: {formatWeekRange(timesheet.weekStarting)}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <StatusBadge status={timesheet.status} />
                    <span className="text-sm text-gray-600">
                      Total Hours: {formatDuration(timesheet.totalHours)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Submitted: {timesheet.submittedAt ? format(parseISO(timesheet.submittedAt), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-navy-600 text-navy-600 hover:bg-navy-50"
                  onClick={() => navigate(`/timesheets/${timesheet.id}`)}
                >
                  View Details
                </Button>
              </div>

              <div className="mb-4">
                <label className="form-label">
                  Rejection Comments (required if rejecting)
                </label>
                <textarea
                  value={rejectComments[timesheet.id] || ''}
                  onChange={(e) => handleCommentChange(timesheet.id, e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Provide feedback on why the timesheet is being rejected..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="destructive"
                  className="btn-danger"
                  onClick={() => handleReject(timesheet.id)}
                  disabled={processingId === timesheet.id}
                >
                  {processingId === timesheet.id && processingId === timesheet.id ? (
                    <>
                      <Spinner size="sm" variant="white" className="mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  className="btn-primary"
                  onClick={() => handleApprove(timesheet.id)}
                  disabled={processingId === timesheet.id}
                >
                  {processingId === timesheet.id && processingId === timesheet.id ? (
                    <>
                      <Spinner size="sm" variant="white" className="mr-2" />
                      Approving...
                    </>
                  ) : (
                    'Approve'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}