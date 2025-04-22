const express = require('express');
const moment = require('moment');
const axios = require('axios');
const TimeSheet = require('../models/timesheet.model');
const TimeEntry = require('../models/timeEntry.model');
const { verifyToken, isManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();
// Create a new timesheet
router.post('/', verifyToken, async (req, res) => {
  try {
    const { weekStarting } = req.body;
    
    // Format week starting date to ensure it's the start of the week
    const formattedWeekStart = moment(weekStarting).startOf('isoWeek').toDate();
    
    // Check if timesheet already exists for this week
    const existingTimesheet = await TimeSheet.findOne({
      userId: req.user._id,
      weekStarting: formattedWeekStart
    });
    
    if (existingTimesheet) {
      // If it exists, make sure to populate entries before returning
      const populatedTimesheet = await TimeSheet.findById(existingTimesheet._id).populate('entries');
      return res.status(400).json({ 
        message: 'A timesheet already exists for this week',
        timesheet: populatedTimesheet
      });
    }
    
    // Create new timesheet
    const timesheet = new TimeSheet({
      userId: req.user._id,
      weekStarting: formattedWeekStart
    });
    
    await timesheet.save();
    
    // Explicitly set entries to empty array before returning
    const newTimesheet = timesheet.toObject();
    newTimesheet.entries = [];
    
    res.status(201).json(newTimesheet);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get all timesheets for current user
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const timesheets = await TimeSheet.find(query)
      .sort({ weekStarting: -1 })
      .populate('entries');
    
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending approvals for managers
router.get('/pending-approvals', verifyToken, isManagerOrAdmin, async (req, res) => {
  try {
    // For managers, get timesheets from their department
    // For admins, get all pending timesheets
    let query = { status: 'submitted' };
    
    if (req.user.role === 'manager' && req.user.department) {
      try {
        // Get all users from the auth service who are in the same department
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
        const usersResponse = await axios.get(
          `${authServiceUrl}/api/users`,
          { headers: { Authorization: req.headers.authorization } }
        );
        
        // Filter users by department
        const departmentUsers = usersResponse.data.filter(
          user => user.department === req.user.department
        );
        
        const departmentUserIds = departmentUsers.map(user => user._id.toString());
        
        // Filter timesheets by these user IDs
        query.userId = { $in: departmentUserIds };
      } catch (error) {
        console.error('Error fetching department users:', error);
        // If there's an error, just continue with the submitted status filter
      }
    }
    
    const timesheets = await TimeSheet.find(query)
      .sort({ submittedAt: 1 })
      .populate('entries');
    
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});// Get a specific timesheet
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const timesheet = await TimeSheet.findById(req.params.id).populate('entries');
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if user has permission to view this timesheet
    if (timesheet.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Submit a timesheet
router.post('/:id/submit', verifyToken, async (req, res) => {
  console.log('Timesheet submission endpoint called for ID:', req.params.id);
  
  try {
    console.log('User from token:', req.user ? {
      id: req.user.id || req.user._id,
      email: req.user.email,
      role: req.user.role
    } : 'No user');
    
    console.log('Finding timesheet by ID');
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      console.log('Timesheet not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    console.log('Timesheet found:', {
      id: timesheet._id.toString(),
      userId: timesheet.userId.toString(),
      status: timesheet.status,
      weekStarting: timesheet.weekStarting
    });
    
    // Improved user ID comparison
    const timesheetUserId = timesheet.userId.toString();
    const requestUserId = (req.user._id || req.user.id).toString();
    
    console.log('Comparing user IDs:', {
      timesheetUserId,
      requestUserId,
      match: timesheetUserId === requestUserId
    });
    
    if (timesheetUserId !== requestUserId) {
      console.log('Access denied: User ID mismatch');
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if timesheet is already submitted or approved
    console.log('Checking timesheet status:', timesheet.status);
    if (timesheet.status === 'submitted' || timesheet.status === 'approved') {
      console.log('Invalid status for submission:', timesheet.status);
      return res.status(400).json({ 
        message: `Timesheet is already ${timesheet.status}` 
      });
    }
    
    // Check if timesheet has entries
    console.log('Counting timesheet entries');
    const entriesCount = await TimeEntry.countDocuments({ timesheetId: timesheet._id });
    console.log('Timesheet entries count:', entriesCount);
    
    if (entriesCount === 0) {
      console.log('Cannot submit empty timesheet');
      return res.status(400).json({ message: 'Cannot submit an empty timesheet' });
    }
    
    // Update all time entries status to submitted
    console.log('Updating time entries status to submitted');
    const updateResult = await TimeEntry.updateMany(
      { timesheetId: timesheet._id },
      { status: 'submitted' }
    );
    console.log('Update result for time entries:', updateResult);
    
    // Update timesheet status
    console.log('Updating timesheet status to submitted');
    timesheet.status = 'submitted';
    timesheet.submittedAt = new Date();
    await timesheet.save();
    
    console.log('Timesheet submitted successfully');
    
    // Return updated timesheet with entries
    console.log('Finding updated timesheet with entries');
    const updatedTimesheet = await TimeSheet.findById(timesheet._id).populate('entries');
    
    console.log('Sending response with updated timesheet');
    res.json(updatedTimesheet);
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});// Approve a timesheet
router.post('/:id/approve', verifyToken, isManagerOrAdmin, async (req, res) => {
  try {
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if timesheet is submitted
    if (timesheet.status !== 'submitted') {
      return res.status(400).json({ 
        message: `Cannot approve a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Update all time entries status to approved
    await TimeEntry.updateMany(
      { timesheetId: timesheet._id },
      { status: 'approved' }
    );
    
    // Update timesheet status
    timesheet.status = 'approved';
    timesheet.approvedAt = new Date();
    timesheet.approvedBy = req.user._id;
    
    if (req.body.comments) {
      timesheet.comments = req.body.comments;
    }
    
    await timesheet.save();
    
    // Return updated timesheet with entries
    const updatedTimesheet = await TimeSheet.findById(timesheet._id).populate('entries');
    
    res.json(updatedTimesheet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject a timesheet
router.post('/:id/reject', verifyToken, isManagerOrAdmin, async (req, res) => {
  try {
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if timesheet is submitted
    if (timesheet.status !== 'submitted') {
      return res.status(400).json({ 
        message: `Cannot reject a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Require comments for rejection
    if (!req.body.comments) {
      return res.status(400).json({ message: 'Comments are required when rejecting a timesheet' });
    }
    
    // Update all time entries status back to draft
    await TimeEntry.updateMany(
      { timesheetId: timesheet._id },
      { status: 'draft' }
    );
    
    // Update timesheet status
    timesheet.status = 'rejected';
    timesheet.comments = req.body.comments;
    await timesheet.save();
    
    // Return updated timesheet with entries
    const updatedTimesheet = await TimeSheet.findById(timesheet._id).populate('entries');
    
    res.json(updatedTimesheet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a timesheet (only if it's in draft status)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const timesheet = await TimeSheet.findById(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if user has permission to delete this timesheet
    if (timesheet.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if timesheet is in draft status
    if (timesheet.status !== 'draft') {
      return res.status(400).json({ 
        message: `Cannot delete a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Delete all associated time entries
    await TimeEntry.deleteMany({ timesheetId: timesheet._id });
    
    // Delete the timesheet
    await TimeSheet.findByIdAndDelete(timesheet._id);
    
    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
