import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { format, addDays } from 'date-fns';

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  project: string;
  description: string;
  status: string;
}

interface TimeSheet {
  id: string;
  userId: string;
  weekStarting: string;
  status: string;
  totalHours: number;
  entries: TimeEntry[];
  submittedAt: string;
  user: {
    firstName: string;
    lastName: string;
    department: string;
    email: string;
  };
}

export function ApproveTimesheet() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [timesheet, setTimesheet] = useState<TimeSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Only managers should access this page
    if (user?.role !== 'manager' && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchTimesheet = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
          {
            query: `
              query GetTimeSheet($id: ID!) {
                timeSheet(id: $id) {
                  id
                  userId
                  weekStarting
                  status
                  totalHours
                  entries {
                    id
                    date
                    startTime
                    endTime
                    project
                    description
                    status
                  }
                  submittedAt
                  user {
                    firstName
                    lastName
                    department
                    email
                  }
                }
              }
            `,
            variables: {
              id,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.data?.timeSheet) {
          setTimesheet(response.data.data.timeSheet);
        } else if (response.data.errors) {
          setError(response.data.errors[0].message);
        }
      } catch (err) {
        setError('Failed to fetch timesheet');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheet();
  }, [id, token, navigate, user]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this timesheet?')) {
      return;
    }

    setApproveLoading(true);
    setError('');

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
        {
          query: `
            mutation ApproveTimeSheet($id: ID!, $comments: String) {
              approveTimeSheet(id: $id, comments: $comments) {
                id
                status
                approvedAt
                approvedBy
                comments
              }
            }
          `,
          variables: {
            id,
            comments: comments.trim() || null,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.data?.approveTimeSheet) {
        navigate('/pending-approvals');
      } else if (response.data.errors) {
        setError(response.data.errors[0].message);
      }
    } catch (err) {
      setError('Failed to approve timesheet');
      console.error(err);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      setError('Please provide comments explaining why the timesheet is being rejected');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this timesheet?')) {
      return;
    }

    setRejectLoading(true);
    setError('');

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
        {
          query: `
            mutation RejectTimeSheet($id: ID!, $comments: String!) {
              rejectTimeSheet(id: $id, comments: $comments) {
                id
                status
                comments
              }
            }
          `,
          variables: {
            id,
            comments: comments.trim(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.data?.rejectTimeSheet) {
        navigate('/pending-approvals');
      } else if (response.data.errors) {
        setError(response.data.errors[0].message);
      }
    } catch (err) {
      setError('Failed to reject timesheet');
      console.error(err);
    } finally {
      setRejectLoading(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!timesheet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-xl font-bold text-destructive">Timesheet not found</div>
        <Button className="mt-4" onClick={() => navigate('/pending-approvals')}>
          Back to Pending Approvals
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary p-4 text-white">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/pending-approvals')}
              className="mr-2 rounded-full p-1 hover:bg-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Review Timesheet</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold">
                {timesheet.user.firstName} {timesheet.user.lastName}
              </h2>
              <p className="text-muted-foreground">{timesheet.user.email}</p>
              <p className="text-muted-foreground">Department: {timesheet.user.department || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium">Week: {formatWeekRange(timesheet.weekStarting)}</h3>
              <p className="text-muted-foreground">Total Hours: {timesheet.totalHours.toFixed(1)}</p>
              <p className="text-muted-foreground">
                Submitted: {format(new Date(timesheet.submittedAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-medium">Time Entries</h3>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheet.entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-4 py-3 text-sm">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-sm">{entry.project || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        {entry.startTime} - {entry.endTime || 'In Progress'}
                      </td>
                      <td className="px-4 py-3 text-sm">{entry.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comments" className="mb-2 block text-sm font-medium">
              Comments (required for rejection)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Add your comments here..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectLoading || approveLoading}
            >
              {rejectLoading ? 'Rejecting...' : 'Reject Timesheet'}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveLoading || rejectLoading}
            >
              {approveLoading ? 'Approving...' : 'Approve Timesheet'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
