const express = require('express');
const moment = require('moment');
const TimeSheet = require('../models/timesheet.model');
const TimeEntry = require('../models/timeEntry.model');
const { verifyToken } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Create a notification
const createNotification = async (userId, type, title, message, relatedId, email) => {
  try {
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004';
    
    await axios.post(`${notificationServiceUrl}/api/notifications`, {
      userId,
      type,
      title,
      message,
      relatedId,
      email
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Create a new timesheet
router.post('/', verifyToken, async (req, res) => {
  try {
    const { weekStarting } = req.body;
    
    // Format week starting date
    const formattedWeekStarting = moment(weekStarting).startOf('isoWeek').toDate();
    
    // Check if timesheet already exists for this week
    const existingTimesheet = await TimeSheet.findOne({
      userId: req.user._id,
      weekStarting: formattedWeekStarting
    });
    
    if (existingTimesheet) {
      return res.status(400).json({ 
        message: 'A timesheet already exists for this week' 
      });
    }
    
    // Calculate week ending date (Sunday)
    const weekEnding = moment(formattedWeekStarting).endOf('isoWeek').toDate();
    
    // Create new timesheet
    const timesheet = new TimeSheet({
      userId: req.user._id,
      weekStarting: formattedWeekStarting,
      weekEnding,
      status: 'draft',
      totalHours: 0
    });
    
    await timesheet.save();
    
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all timesheets for current user
router.get('/my', verifyToken, async (req, res) => {
  try {
    const timesheets = await TimeSheet.find({ userId: req.user._id })
      .sort({ weekStarting: -1 });
    
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific timesheet with its entries
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if user has permission to view this timesheet
    if (timesheet.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all time entries for this timesheet
    const timeEntries = await TimeEntry.find({ timesheetId: timesheet._id })
      .sort({ date: 1, startTime: 1 });
    
    // Add entries to the timesheet response
    const timesheetWithEntries = timesheet.toObject();
    timesheetWithEntries.entries = timeEntries;
    
    res.json(timesheetWithEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit a timesheet for approval
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if user has permission to submit this timesheet
    if (timesheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if timesheet is in a state that allows submission
    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      return res.status(400).json({ 
        message: `Cannot submit a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Get all time entries for this timesheet
    const timeEntries = await TimeEntry.find({ timesheetId: timesheet._id });
    
    // Check if timesheet has entries
    if (timeEntries.length === 0) {
      return res.status(400).json({ 
        message: 'Cannot submit an empty timesheet' 
      });
    }
    
    // Update timesheet status
    timesheet.status = 'pending';
    timesheet.submittedAt = new Date();
    await timesheet.save();
    
    // Update all time entries status
    await TimeEntry.updateMany(
      { timesheetId: timesheet._id },
      { status: 'pending' }
    );
    
    // Notify managers about the timesheet submission
    // In a real system, you would get the manager's ID from the user's department
    const managerId = 'manager-id'; // Replace with actual manager ID
    
    await createNotification(
      managerId,
      'timesheet_submitted',
      'Timesheet Submitted',
      `A timesheet has been submitted for the week of ${moment(timesheet.weekStarting).format('MMM D, YYYY')}`,
      timesheet._id
    );
    
    // Add entries to the timesheet response
    const timesheetWithEntries = timesheet.toObject();
    timesheetWithEntries.entries = timeEntries;
    
    res.json(timesheetWithEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all pending timesheets (for managers)
router.get('/pending/approval', verifyToken, async (req, res) => {
  try {
    // Check if user is a manager or admin
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all pending timesheets
    // In a real system, you would filter by department or team
    const pendingTimesheets = await TimeSheet.find({ status: 'pending' })
      .sort({ submittedAt: 1 });
    
    // Get all time entries for these timesheets
    const timesheetsWithEntries = await Promise.all(
      pendingTimesheets.map(async (timesheet) => {
        const timeEntries = await TimeEntry.find({ timesheetId: timesheet._id })
          .sort({ date: 1, startTime: 1 });
        
        const timesheetObj = timesheet.toObject();
        timesheetObj.entries = timeEntries;
        
        return timesheetObj;
      })
    );
    
    res.json(timesheetsWithEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve a timesheet
router.post('/:id/approve', verifyToken, async (req, res) => {
  try {
    // Check if user is a manager or admin
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { comments } = req.body;
    
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if timesheet is in a state that allows approval
    if (timesheet.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot approve a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Update timesheet status
    timesheet.status = 'approved';
    timesheet.approvedAt = new Date();
    timesheet.approvedBy = req.user._id;
    timesheet.comments = comments;
    await timesheet.save();
    
    // Update all time entries status
    await TimeEntry.updateMany(
      { timesheetId: timesheet._id },
      { status: 'approved' }
    );
    
    // Notify the user about the approval
    await createNotification(
      timesheet.userId,
      'timesheet_approved',
      'Timesheet Approved',
      `Your timesheet for the week of ${moment(timesheet.weekStarting).format('MMM D, YYYY')} has been approved.`,
      timesheet._id
    );
    
    // Get all time entries for this timesheet
    const timeEntries = await TimeEntry.find({ timesheetId: timesheet._id })
      .sort({ date: 1, startTime: 1 });
    
    // Add entries to the timesheet response
    const timesheetWithEntries = timesheet.toObject();
    timesheetWithEntries.entries = timeEntries;
    
    res.json(timesheetWithEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject a timesheet
router.post('/:id/reject', verifyToken, async (req, res) => {
  try {
    // Check if user is a manager or admin
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({ message: 'Comments are required when rejecting a timesheet' });
    }
    
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if timesheet is in a state that allows rejection
    if (timesheet.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot reject a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Update timesheet status
    timesheet.status = 'rejected';
    timesheet.rejectedAt = new Date();
    timesheet.rejectedBy = req.user._id;
    timesheet.comments = comments;
    await timesheet.save();
    
    // Update all time entries status
    await TimeEntry.updateMany(
      { timesheetId: timesheet._id },
      { status: 'rejected' }
    );
    
    // Notify the user about the rejection
    await createNotification(
      timesheet.userId,
      'timesheet_rejected',
      'Timesheet Rejected',
      `Your timesheet for the week of ${moment(timesheet.weekStarting).format('MMM D, YYYY')} has been rejected. Reason: ${comments}`,
      timesheet._id
    );
    
    // Get all time entries for this timesheet
    const timeEntries = await TimeEntry.find({ timesheetId: timesheet._id })
      .sort({ date: 1, startTime: 1 });
    
    // Add entries to the timesheet response
    const timesheetWithEntries = timesheet.toObject();
    timesheetWithEntries.entries = timeEntries;
    
    res.json(timesheetWithEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
