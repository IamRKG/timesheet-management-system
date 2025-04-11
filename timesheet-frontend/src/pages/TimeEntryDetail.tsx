import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { Layout } from '../components/layout';
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
    
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await deleteTimeEntry(id);
      
      if (currentTimeEntry.timesheetId) {
        navigate(`/timesheets/${currentTimeEntry.timesheetId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !currentTimeEntry) {
    return (
      <Layout title="Time Entry Details">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!currentTimeEntry) {
    return (
      <Layout title="Time Entry Details">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-xl font-bold text-red-600">Time entry not found</div>
          <Button 
            className="mt-4 bg-navy-600 text-white hover:bg-navy-700" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const canEdit = currentTimeEntry.status === 'draft';
  const formattedDate = format(new Date(currentTimeEntry.date), 'EEEE, MMMM d, yyyy');
  const backUrl = currentTimeEntry.timesheetId 
    ? `/timesheets/${currentTimeEntry.timesheetId}` 
    : '/dashboard';

  return (
    <Layout title="Time Entry Details" showBackButton backUrl={backUrl}>
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {(error || deleteError) && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error || deleteError}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold text-navy-700">{formattedDate}</h2>
          <div className="mt-2 flex items-center">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              currentTimeEntry.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : currentTimeEntry.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : currentTimeEntry.status === 'submitted'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {currentTimeEntry.status.charAt(0).toUpperCase() + currentTimeEntry.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Start Time</p>
            <p className="font-medium text-navy-700">{currentTimeEntry.startTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">End Time</p>
            <p className="font-medium text-navy-700">{currentTimeEntry.endTime || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Project</p>
            <p className="font-medium text-navy-700">{currentTimeEntry.project || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium text-navy-700">
              {currentTimeEntry.duration ? `${currentTimeEntry.duration.toFixed(2)} hours` : 'Not calculated'}
            </p>
          </div>
        </div>

        {currentTimeEntry.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Description</p>
            <p className="whitespace-pre-wrap text-gray-700">{currentTimeEntry.description}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {canEdit && (
            <>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
              <Button 
                className="bg-navy-600 text-white hover:bg-navy-700"
                onClick={() => navigate(`/time-entries/edit/${currentTimeEntry.id}`)}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
