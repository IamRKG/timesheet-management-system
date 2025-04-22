import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, parseISO } from 'date-fns';
import { Layout } from '../components/layout';
import { Alert } from '../components/ui/alert';
import { Spinner } from '../components/ui/spinner';
import { useTimesheetStore } from '../store/timesheetStore';
import { TimeEntryInput } from '../services/timesheet.service';

export function TimeEntryForm() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const { 
    currentTimeEntry, 
    fetchTimeEntry, 
    createTimeEntry, 
    updateTimeEntry,
    loading,
    error,
    clearError,
    clearCurrentTimeEntry
  } = useTimesheetStore();
  
  const [formData, setFormData] = useState<TimeEntryInput>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    project: '',
    description: '',
  });
  
  const [formError, setFormError] = useState('');
  const [timesheetId, setTimesheetId] = useState<string | null>(null);

  // Extract timesheetId from query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tsId = params.get('timesheetId');
    if (tsId) {
      setTimesheetId(tsId);
    }
  }, [location]);

  useEffect(() => {
    clearError();
    
    // If editing, fetch the time entry data
    if (isEditing && id) {
      fetchTimeEntry(id);
    }
    
    // Cleanup
    return () => {
      clearCurrentTimeEntry();
    };
  }, [isEditing, id, fetchTimeEntry, clearError, clearCurrentTimeEntry]);

  // Populate form when currentTimeEntry changes
  useEffect(() => {
    if (currentTimeEntry && isEditing) {
      setFormData({
        date: format(parseISO(currentTimeEntry.date), 'yyyy-MM-dd'),
        startTime: currentTimeEntry.startTime,
        endTime: currentTimeEntry.endTime || '',
        project: currentTimeEntry.project || '',
        description: currentTimeEntry.description || '',
      });
      
      if (currentTimeEntry.timesheetId) {
        setTimesheetId(currentTimeEntry.timesheetId);
      }
    }
  }, [currentTimeEntry, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return null;
    
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    let durationInMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    
    // Handle case where end time is on the next day
    if (durationInMinutes < 0) {
      durationInMinutes += 24 * 60;
    }
    
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    try {
      if (isEditing && id) {
        await updateTimeEntry(id, formData);
        navigate(`/time-entries/${id}`);
      } else {
        const newEntry = await createTimeEntry(formData);
        if (timesheetId) {
          navigate(`/timesheets/${timesheetId}`);
        } else if (newEntry.timesheetId) {
          navigate(`/timesheets/${newEntry.timesheetId}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const duration = calculateDuration();

  if (loading && isEditing && !currentTimeEntry) {
    return (
      <Layout title="Time Entry" showBackButton>
        <div className="flex justify-center py-12">
          <Spinner label="Loading time entry..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={isEditing ? 'Edit Time Entry' : 'Log Time Entry'} 
      showBackButton 
      backUrl={timesheetId ? `/timesheets/${timesheetId}` : '/dashboard'}
    >
      <div className="mx-auto max-w-2xl">
        {(formError || error) && (
          <Alert 
            variant="error" 
            className="mb-6"
            onClose={() => {
              setFormError('');
              clearError();
            }}
          >
            {formError || error}
          </Alert>
        )}

        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-navy-700">
            {isEditing ? 'Edit Time Entry' : 'New Time Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="project" className="form-label">
                  Project
                </label>
                <input
                  type="text"
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Project name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startTime" className="form-label">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="form-label">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {duration && (
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-700">
                  Duration: <span className="text-navy-600">{duration}</span>
                </p>
              </div>
            )}

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="form-input"
                placeholder="What did you work on?"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(timesheetId ? `/timesheets/${timesheetId}` : '/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" variant="white" className="mr-2" />
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditing ? 'Update Time Entry' : 'Save Time Entry'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}