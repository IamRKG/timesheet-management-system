const mongoose = require('mongoose');
const moment = require('moment');

const timeEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },
  endTime: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },
  duration: {
    type: Number,
    min: 0
  },
  project: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  timesheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSheet'
  }
}, {
  timestamps: true
});

// Calculate duration before saving if start and end time are provided
timeEntrySchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = moment(this.startTime, 'HH:mm');
    const end = moment(this.endTime, 'HH:mm');
    
    // Handle case where end time is on the next day
    let duration = end.diff(start, 'hours', true);
    if (duration < 0) {
      duration += 24;
    }
    
    this.duration = parseFloat(duration.toFixed(2));
  }
  next();
});

// Add a toJSON method to ensure proper serialization
timeEntrySchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

timeEntrySchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

module.exports = TimeEntry;
