import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { Layout } from '../components/layout';
import { StatusBadge } from '../components/ui/status-badge';
import { Spinner } from '../components/ui/spinner';
import { Alert } from '../components/ui/alert';
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

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filteredTimesheets, setFilteredTimesheets] = useState(timesheets);

  useEffect(() => {
    clearError();
    fetchMyTimesheets();
  }, [fetchMyTimesheets, clearError]);

  useEffect(() => {
    if (filterStatus) {
      setFilteredTimesheets(timesheets.filter(ts => ts.status === filterStatus));
    } else {
      setFilteredTimesheets(timesheets);
    }
  }, [timesheets, filterStatus]);

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

  const renderTimesheetActions = (
    <Button 
      className="btn-primary"
      onClick={handleCreateTimesheet}
    >
      New Timesheet
    </Button>
  );

  return (
    <Layout 
      title="My Timesheets" 
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

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-700">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          {filteredTimesheets.length} timesheet{filteredTimesheets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading && timesheets.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner label="Loading your timesheets..." />
        </div>
      ) : filteredTimesheets.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          {filterStatus ? (
            <>
              <h3 className="text-lg font-medium text-gray-900">No {filterStatus} timesheets</h3>
              <p className="mt-2 text-gray-600">Try changing your filter or create a new timesheet.</p>
              <Button 
                className="mt-6 btn-primary"
                onClick={() => setFilterStatus('')}
              >
                Clear Filter
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900">No timesheets yet</h3>
              <p className="mt-2 text-gray-600">Get started by creating your first timesheet.</p>
              <Button 
                className="mt-6 btn-primary"
                onClick={handleCreateTimesheet}
              >
                Create Your First Timesheet
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTimesheets.map((timesheet) => (
            <div 
              key={timesheet.id} 
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              onClick={() => navigate(`/timesheets/${timesheet.id}`)}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-navy-700">
                    {formatWeekRange(timesheet.weekStarting)}
                  </h3>
                  <div className="mt-1 flex items-center gap-3">
                    <StatusBadge status={timesheet.status} />
                    <span className="text-sm text-gray-600">
                      {timesheet.totalHours.toFixed(1)} hours
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {timesheet.submittedAt && (
                    <span className="text-xs text-gray-500">
                      Submitted: {format(parseISO(timesheet.submittedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                  {timesheet.approvedAt && (
                    <span className="text-xs text-gray-500">
                      Approved: {format(parseISO(timesheet.approvedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-navy-600 hover:bg-navy-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/timesheets/${timesheet.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}