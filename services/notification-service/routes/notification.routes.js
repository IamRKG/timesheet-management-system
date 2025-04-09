const express = require('express');
const Notification = require('../models/notification.model');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, relatedId, email } = req.body;
    
    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false
    });
    
    await notification.save();
    
    // Send email notification if email is provided
    if (email) {
      // Implement email sending logic here
      // This could use nodemailer or another email service
    }
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all notifications for current user
router.get('/my', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user has permission to update this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user has permission to delete this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await notification.remove();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;