const { gql } = require('apollo-server-express');
// Import all schema definitions
const userSchema = require('./user.schema');
const timeEntrySchema = require('./timeEntry.schema');
const timesheetSchema = require('./timesheet.schema');
const notificationSchema = require('./notification.schema');
const combinedSchema = require('./combined.schema');

// Base schema with Query and Mutation types
const baseSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

// Export all schemas as an array
module.exports = [
  baseSchema,
  userSchema,
  timeEntrySchema,
  timesheetSchema,
  notificationSchema,
  combinedSchema
];
