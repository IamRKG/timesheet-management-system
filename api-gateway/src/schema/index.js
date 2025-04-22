const gql = require('../utils/gql');
const userSchema = require('./user.schema');
const timeEntrySchema = require('./timeEntry.schema');
const timesheetSchema = require('./timesheet.schema');
const reportSchema = require('./report.schema');

const baseSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

module.exports = [
  baseSchema,
  userSchema,
  timeEntrySchema,
  timesheetSchema,
  reportSchema
];