import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { Layout } from '../components/layout';
import { useTimesheetStore } from '../store/timesheetStore';
import { TimeEntryInput } from '../services/timesheet.service';

export function TimeEntryForm() {
  const { id } = useParams<{ id?: string }>();
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
        date: currentTimeEntry.date,
        startTime: currentTimeEntry.startTime,
        endTime: currentTimeEntry.endTime || '',
        project: currentTimeEntry.project || '',
        description: currentTimeEntry.description || '',
      });
    }
  }, [currentTimeEntry, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        if (newEntry.timesheetId) {
          navigate(`/timesheets/${newEntry.timesheetId}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Layout 
      title={isEditing ? 'Edit Time Entry' : 'Log Time Entry'} 
      showBackButton 
      backUrl={isEditing && currentTimeEntry?.timesheetId 
        ? `/timesheets/${currentTimeEntry.timesheetId}` 
        : '/dashboard'
      }
    >
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {(formError || error) && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="date" className="mb-2 block text-sm font-medium text-navy-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-500 focus:ring-navy-500"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-navy-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-500 focus:ring-navy-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="mb-2 block text-sm font-medium text-navy-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-500 focus:ring-navy-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="project" className="mb-2 block text-sm font-medium text-navy-700">
              Project
            </label>
            <input
              type="text"
              id="project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-500 focus:ring-navy-500"
              placeholder="Project name"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-navy-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-navy-500 focus:ring-navy-500"
              placeholder="What did you work on?"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-gray-700"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-navy-600 text-white hover:bg-navy-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
