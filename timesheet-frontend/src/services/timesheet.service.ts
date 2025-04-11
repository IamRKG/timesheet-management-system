import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  project?: string;
  description?: string;
  status: string;
  timesheetId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSheet {
  id: string;
  userId: string;
  weekStarting: string;
  status: string;
  totalHours: number;
  entries: TimeEntry[];
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeEntryInput {
  date: string;
  startTime: string;
  endTime?: string;
  project?: string;
  description?: string;
}

class TimesheetService {
  // Time Entry Methods
  async createTimeEntry(token: string, input: TimeEntryInput): Promise<TimeEntry> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation CreateTimeEntry($input: TimeEntryInput!) {
              createTimeEntry(input: $input) {
                id
                userId
                date
                startTime
                endTime
                duration
                project
                description
                status
                timesheetId
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            input,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.createTimeEntry;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create time entry');
    }
  }

  async getTimeEntry(token: string, id: string): Promise<TimeEntry> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            query GetTimeEntry($id: ID!) {
              timeEntry(id: $id) {
                id
                userId
                date
                startTime
                endTime
                duration
                project
                description
                status
                timesheetId
                createdAt
                updatedAt
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

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.timeEntry;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch time entry');
    }
  }

  async getMyTimeEntries(token: string, startDate?: string, endDate?: string): Promise<TimeEntry[]> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            query GetMyTimeEntries($startDate: String, $endDate: String) {
              myTimeEntries(startDate: $startDate, endDate: $endDate) {
                id
                userId
                date
                startTime
                endTime
                duration
                project
                description
                status
                timesheetId
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            startDate,
            endDate,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.myTimeEntries;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch time entries');
    }
  }

  async updateTimeEntry(token: string, id: string, input: TimeEntryInput): Promise<TimeEntry> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation UpdateTimeEntry($id: ID!, $input: TimeEntryInput!) {
              updateTimeEntry(id: $id, input: $input) {
                id
                userId
                date
                startTime
                endTime
                duration
                project
                description
                status
                timesheetId
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            id,
            input,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.updateTimeEntry;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update time entry');
    }
  }

  async deleteTimeEntry(token: string, id: string): Promise<boolean> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation DeleteTimeEntry($id: ID!) {
              deleteTimeEntry(id: $id)
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

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.deleteTimeEntry;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete time entry');
    }
  }

  // Timesheet Methods
  async createTimesheet(token: string, weekStarting: string): Promise<TimeSheet> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation CreateTimeSheet($weekStarting: String!) {
              createTimeSheet(weekStarting: $weekStarting) {
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
                approvedAt
                comments
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            weekStarting,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.createTimeSheet;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create timesheet');
    }
  }

  async getTimesheet(token: string, id: string): Promise<TimeSheet> {
    try {
      const response = await axios.post(
        API_URL,
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
                approvedAt
                comments
                createdAt
                updatedAt
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

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.timeSheet;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch timesheet');
    }
  }

  async getMyTimesheets(token: string, status?: string): Promise<TimeSheet[]> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            query GetMyTimeSheets($status: String) {
              myTimeSheets(status: $status) {
                id
                userId
                weekStarting
                status
                totalHours
                submittedAt
                approvedAt
                comments
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            status,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.myTimeSheets;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch timesheets');
    }
  }

  async submitTimesheet(token: string, id: string): Promise<TimeSheet> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation SubmitTimeSheet($id: ID!) {
              submitTimeSheet(id: $id) {
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
                approvedAt
                comments
                createdAt
                updatedAt
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

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.submitTimeSheet;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to submit timesheet');
    }
  }

  // For managers/admins
  async getPendingApprovals(token: string): Promise<TimeSheet[]> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            query GetPendingApprovals {
              pendingApprovals {
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
                approvedAt
                comments
                createdAt
                updatedAt
              }
            }
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.pendingApprovals;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch pending approvals');
    }
  }

  async approveTimesheet(token: string, id: string, comments?: string): Promise<TimeSheet> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation ApproveTimeSheet($id: ID!, $comments: String) {
              approveTimeSheet(id: $id, comments: $comments) {
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
                approvedAt
                comments
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            id,
            comments,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.approveTimeSheet;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to approve timesheet');
    }
  }

  async rejectTimesheet(token: string, id: string, comments: string): Promise<TimeSheet> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation RejectTimeSheet($id: ID!, $comments: String!) {
              rejectTimeSheet(id: $id, comments: $comments) {
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
                approvedAt
                comments
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            id,
            comments,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.rejectTimeSheet;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject timesheet');
    }
  }
}

export const timesheetService = new TimesheetService();
