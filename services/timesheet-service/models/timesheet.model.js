const mongoose = require('mongoose');
const moment = require('moment');

const timeSheetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  weekStarting: {
    type: Date,
    required: true
  },
  weekEnding: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time entries
timeSheetSchema.virtual('entries', {
  ref: 'TimeEntry',
  localField: '_id',
  foreignField: 'timesheetId'
});

// Calculate week ending date before saving
timeSheetSchema.pre('save', function(next) {
  if (this.weekStarting && !this.weekEnding) {
    this.weekEnding = moment(this.weekStarting).add(6, 'days').toDate();
  }
  next();
});

const TimeSheet = mongoose.model('TimeSheet', timeSheetSchema);

module.exports = TimeSheet;
