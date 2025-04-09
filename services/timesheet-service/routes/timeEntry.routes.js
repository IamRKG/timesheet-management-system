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

// Get all time entries for a specific timesheet
router.get('/timesheet/:timesheetId', verifyToken, async (req, res) => {
  try {
    const { timesheetId } = req.params;
    
    // Find the timesheet
    const timesheet = await TimeSheet.findById(timesheetId);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if user has permission to view this timesheet
    if (timesheet.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all time entries for this timesheet
    const timeEntries = await TimeEntry.find({ timesheetId });
    
    res.json(timeEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all time entries for current user within a date range
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.date.$lte = new Date(endDate);
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
    
    // Check if user has permission to view this time entry
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
    const { date, startTime, endTime, project, description } = req.body;
    
    // Find the time entry
    const timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    // Check if user has permission to update this time entry
    if (timeEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the associated timesheet
    const timesheet = await TimeSheet.findById(timeEntry.timesheetId);
    
    // Check if timesheet is in a state that allows updates
    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      return res.status(400).json({ 
        message: `Cannot update entries in a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Update the time entry
    if (date) timeEntry.date = new Date(date);
    if (startTime) timeEntry.startTime = startTime;
    if (endTime) timeEntry.endTime = endTime;
    if (project) timeEntry.project = project;
    if (description) timeEntry.description = description;
    
    // Calculate duration if both start and end times are provided
    if (startTime && endTime) {
      const startMinutes = convertTimeToMinutes(startTime);
      const endMinutes = convertTimeToMinutes(endTime);
      
      if (endMinutes > startMinutes) {
        timeEntry.duration = (endMinutes - startMinutes) / 60;
      }
    }
    
    await timeEntry.save();
    
    // Update timesheet total hours
    await updateTimesheetTotalHours(timesheet._id);
    
    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a time entry
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Find the time entry
    const timeEntry = await TimeEntry.findById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    // Check if user has permission to delete this time entry
    if (timeEntry.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the associated timesheet
    const timesheet = await TimeSheet.findById(timeEntry.timesheetId);
    
    // Check if timesheet is in a state that allows deletions
    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      return res.status(400).json({ 
        message: `Cannot delete entries from a timesheet with status: ${timesheet.status}` 
      });
    }
    
    // Delete the time entry
    await TimeEntry.findByIdAndDelete(req.params.id);
    
    // Update timesheet total hours
    await updateTimesheetTotalHours(timesheet._id);
    
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to convert time string (HH:MM) to minutes
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to update timesheet total hours
async function updateTimesheetTotalHours(timesheetId) {
  try {
    const timeEntries = await TimeEntry.find({ timesheetId });
    
    const totalHours = timeEntries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
    
    await TimeSheet.findByIdAndUpdate(timesheetId, { totalHours });
  } catch (error) {
    console.error('Error updating timesheet total hours:', error);
  }
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
