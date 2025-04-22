import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, parseISO } from 'date-fns';
import { Layout } from '../components/layout';
import { StatusBadge } from '../components/ui/status-badge';
import { Spinner } from '../components/ui/spinner';
import { Alert } from '../components/ui/alert';
import { useTimesheetStore } from '../store/timesheetStore';

export function TimeEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    currentTimeEntry, 
    fetchTimeEntry, 
    deleteTimeEntry,
    loading, 
    error,
    clearError,
    clearCurrentTimeEntry
  } = useTimesheetStore();
  
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (id) {
      clearError();
      fetchTimeEntry(id);
    }
    
    // Cleanup
    return () => {
      clearCurrentTimeEntry();
    };
  }, [id, fetchTimeEntry, clearError, clearCurrentTimeEntry]);

  const handleDelete = async () => {
    if (!id || !currentTimeEntry) return;
    
    if (!window.confirm('Are you sure you want to delete this time entry? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await deleteTimeEntry(id);
      
      setSuccessMessage('Time entry deleted successfully!');
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        if (currentTimeEntry.timesheetId) {
          navigate(`/timesheets/${currentTimeEntry.timesheetId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  };

  const formatDuration = (hours: number | undefined) => {
    if (!hours) return 'Not calculated';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    }
    
    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (loading && !currentTimeEntry) {
    return (
      <Layout title="Time Entry Details">
        <div className="flex justify-center py-12">
          <Spinner label="Loading time entry details..." />
        </div>
      </Layout>
    );
  }

  if (!currentTimeEntry && !loading) {
    return (
      <Layout title="Time Entry Details">
        <Alert variant="error" className="mb-6">
          Time entry not found. It may have been deleted or you don't have permission to view it.
        </Alert>
        <div className="flex justify-center">
          <Button 
            className="btn-primary" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  if (!currentTimeEntry) return null;

  const canEdit = currentTimeEntry.status === 'draft';
  const formattedDate = format(parseISO(currentTimeEntry.date), 'EEEE, MMMM d, yyyy');
  const backUrl = currentTimeEntry.timesheetId 
    ? `/timesheets/${currentTimeEntry.timesheetId}` 
    : '/dashboard';

  const renderTimeEntryActions = canEdit && (
    <>
      <Button 
        variant="outline"
        className="border-navy-600 text-navy-600 hover:bg-navy-50"
        onClick={() => navigate(`/time-entries/edit/${currentTimeEntry.id}`)}
      >
        Edit
      </Button>
      <Button 
        variant="destructive" 
        className="btn-danger"
        onClick={handleDelete}
        disabled={deleteLoading}
      >
        {deleteLoading ? (
          <>
            <Spinner size="sm" variant="white" className="mr-2" />
            Deleting...
          </>
        ) : (
          'Delete'
        )}
      </Button>
    </>
  );

  return (
    <Layout 
      title="Time Entry Details" 
      showBackButton 
      backUrl={backUrl}
      actions={renderTimeEntryActions}
    >
      {(error || deleteError) && (
        <Alert 
          variant="error" 
          className="mb-6"
          onClose={() => {
            clearError();
            setDeleteError('');
          }}
        >
          {error || deleteError}
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

      <div className="mx-auto max-w-2xl">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-700">{formattedDate}</h2>
            <div className="mt-2 flex items-center">
              <StatusBadge status={currentTimeEntry.status} />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Time Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Time:</span>
                  <span className="text-sm font-medium">{currentTimeEntry.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">End Time:</span>
                  <span className="text-sm font-medium">{currentTimeEntry.endTime || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium">{formatDuration(currentTimeEntry.duration)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Project Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Project:</span>
                  <span className="text-sm font-medium">{currentTimeEntry.project || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={currentTimeEntry.status} />
                </div>
                {currentTimeEntry.timesheetId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Timesheet:</span>
                    <Button 
                      variant="link" 
                      size="sm"
                      className="h-auto p-0 text-navy-600"
                      onClick={() => navigate(`/timesheets/${currentTimeEntry.timesheetId}`)}
                    >
                      View Timesheet
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {currentTimeEntry.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Description</h3>
              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-700">{currentTimeEntry.description}</p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <div>Created: {currentTimeEntry.createdAt ? format(parseISO(currentTimeEntry.createdAt), 'MMM d, yyyy HH:mm') : 'N/A'}</div>
            {currentTimeEntry.updatedAt && currentTimeEntry.updatedAt !== currentTimeEntry.createdAt && (
              <div>Last Updated: {format(parseISO(currentTimeEntry.updatedAt), 'MMM d, yyyy HH:mm')}</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}