import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, addDays } from 'date-fns';
import { Layout } from '../components/layout';
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

  useEffect(() => {
    clearError();
    fetchPendingApprovals();
  }, [fetchPendingApprovals, clearError]);

  const formatWeekRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this timesheet?')) {
      return;
    }
    
    setProcessingId(id);
    try {
      await approveTimesheet(id);
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
      // Clear the comments for this timesheet
      setRejectComments(prev => {
        const updated = {...prev};
        delete updated[id];
        return updated;
      });
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
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && pendingApprovals.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent"></div>
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">No timesheets pending approval.</p>
          <Button 
            className="mt-4 bg-navy-600 text-white hover:bg-navy-700"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.map((timesheet) => (
            <div key={timesheet.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-navy-700">
                    Week: {formatWeekRange(timesheet.weekStarting)}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Submitted: {timesheet.submittedAt ? format(new Date(timesheet.submittedAt), 'MMM d, yyyy') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Hours: {timesheet.totalHours.toFixed(1)}
                  </p>
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
                <label className="mb-2 block text-sm font-medium text-navy-700">
                  Rejection Comments (required if rejecting)
                </label>
                <textarea
                  value={rejectComments[timesheet.id] || ''}
                  onChange={(e) => handleCommentChange(timesheet.id, e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-500 focus:ring-navy-500"
                  rows={3}
                  placeholder="Provide feedback on why the timesheet is being rejected..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(timesheet.id)}
                  disabled={processingId === timesheet.id}
                >
                  {processingId === timesheet.id ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  className="bg-navy-600 text-white hover:bg-navy-700"
                  onClick={() => handleApprove(timesheet.id)}
                  disabled={processingId === timesheet.id}
                >
                  {processingId === timesheet.id ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
