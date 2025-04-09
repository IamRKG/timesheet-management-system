const express = require('express');
const moment = require('moment');
const TimeEntry = require('../models/timeEntry.model');
const TimeSheet = require('../models/timesheet.model');
const { verifyToken, isManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a new time entry
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creating time entry with data:', req.body);
    console.log('User:', req.user);
    
    const { date, startTime, endTime, project, description } = req.body;
    
    // Format date to ensure consistency
    const formattedDate = moment(date).startOf('day').toDate();
    
    // Find or create timesheet for this week
    const weekStart = moment(formattedDate).startOf('isoWeek').toDate();
    
    let timesheet = await TimeSheet.findOne({
      userId: req.user._id,
      weekStarting: weekStart
    });
    
    if (!timesheet) {
      timesheet = new TimeSheet({
        userId: req.user._id,
        weekStarting: weekStart
      });
      await timesheet.save();
    }
    
    // Check if timesheet is already submitted or approved
    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      return res.status(400).json({ 
        message: `Cannot add entries to a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Create time entry
    const timeEntry = new TimeEntry({
      userId: req.user._id,
      date: formattedDate,
      startTime,
      endTime,
      project,
      description,
      timesheetId: timesheet._id,
      status: 'draft'
    });
    
    const savedEntry = await timeEntry.save();
    
    // Update timesheet total hours
    await updateTimesheetTotalHours(timesheet._id);
    
    // Convert to plain object and explicitly add id field
    const responseObject = savedEntry.toObject();
    responseObject.id = responseObject._id.toString();
    
    console.log('Sending response with time entry:', responseObject);
    
    res.status(201).json(responseObject);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all time entries for current user within date range
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = moment(startDate).startOf('day').toDate();
      }
      if (endDate) {
        query.date.$lte = moment(endDate).endOf('day').toDate();
      }
    }
    
    const timeEntries = await TimeEntry.find(query).sort({ date: 1, startTime: 1 });
    
    res.json(timeEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific time entry
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    // Check if user has permission to view this entry
    if (timeEntry.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a time entry
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    // Check if user has permission to update this entry
    if (timeEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get associated timesheet
    const timesheet = await TimeSheet.findById(timeEntry.timesheetId);
    
    // Check if timesheet is already submitted or approved
    if (timesheet && (timesheet.status === 'submitted' || timesheet.status === 'approved')) {
      return res.status(400).json({ 
        message: `Cannot update entries in a timesheet with status: ${timesheet.status}` 
      });
    }
    
    const { date, startTime, endTime, project, description } = req.body;
    
    // Update time entry
    const updatedEntry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      {
        date: date ? moment(date).startOf('day').toDate() : timeEntry.date,
        startTime: startTime || timeEntry.startTime,
        endTime,
        project,
        description
      },
      { new: true, runValidators: true }
    );
    
    // Update timesheet total hours
    if (timesheet) {
      await updateTimesheetTotalHours(timesheet._id);
    }
    
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a time entry
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    // Check if user has permission to delete this entry
    if (timeEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get associated timesheet
    const timesheet = await TimeSheet.findById(timeEntry.timesheetId);
    
    // Check if timesheet is already submitted or approved
    if (timesheet && (timesheet.status === 'submitted' || timesheet.status === 'approved')) {
      return res.status(400).json({ 
        message: `Cannot delete entries from a timesheet with status: ${timesheet.status}` 
      });
    }
    
    await TimeEntry.findByIdAndDelete(req.params.id);
    
    // Update timesheet total hours
    if (timesheet) {
      await updateTimesheetTotalHours(timesheet._id);
    }
    
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update timesheet total hours
async function updateTimesheetTotalHours(timesheetId) {
  const entries = await TimeEntry.find({ timesheetId });
  
  const totalHours = entries.reduce((sum, entry) => {
    return sum + (entry.duration || 0);
  }, 0);
  
  await TimeSheet.findByIdAndUpdate(timesheetId, { 
    totalHours: parseFloat(totalHours.toFixed(2)) 
  });
}

// Add this test endpoint
router.get('/test', (req, res) => {
  const testEntry = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    duration: 8,
    project: 'Test Project',
    description: 'Test Description',
    status: 'draft'
  };
  
  // Add id field explicitly
  testEntry.id = testEntry._id.toString();
  
  res.json(testEntry);
});

module.exports = router;
