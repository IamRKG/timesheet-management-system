const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const { verifyToken, isManagerOrAdmin } = require('./middleware/auth');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get('/api/reports/department', verifyToken, isManagerOrAdmin, async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;
    
    if (!department || !startDate || !endDate) {
      return res.status(400).json({ message: 'Department, start date, and end date are required' });
    }
    
    // Get users from the department
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
    const usersResponse = await axios.get(
      `${authServiceUrl}/api/users?department=${department}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    const userIds = usersResponse.data.map(user => user._id.toString());
    
    // Get timesheets for these users
    const timesheetServiceUrl = process.env.TIMESHEET_SERVICE_URL || 'http://localhost:4002';
    const timesheetsResponse = await axios.get(
      `${timesheetServiceUrl}/api/timesheets/report?userIds=${userIds.join(',')}&startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    res.json(timesheetsResponse.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/reports/project', verifyToken, isManagerOrAdmin, async (req, res) => {
  try {
    const { project, startDate, endDate } = req.query;
    
    if (!project || !startDate || !endDate) {
      return res.status(400).json({ message: 'Project, start date, and end date are required' });
    }
    
    // Get time entries for this project
    const timesheetServiceUrl = process.env.TIMESHEET_SERVICE_URL || 'http://localhost:4002';
    const entriesResponse = await axios.get(
      `${timesheetServiceUrl}/api/time-entries/project?project=${project}&startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    res.json(entriesResponse.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Reporting service running on port ${PORT}`);
});