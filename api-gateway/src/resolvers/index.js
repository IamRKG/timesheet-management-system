const timeEntryResolver = require('./timeEntry.resolver');
const userResolver = require('./user.resolver');
const timesheetResolver = require('./timesheet.resolver');
const reportResolver = require('./report.resolver');

// Merge all resolvers
module.exports = {
  Query: {
    ...userResolver.Query,
    ...timeEntryResolver.Query,
    ...timesheetResolver.Query,
    ...reportResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...timeEntryResolver.Mutation,
    ...timesheetResolver.Mutation,
  },
  // Add any type resolvers
  TimeEntry: timeEntryResolver.TimeEntry,
  // Add other type resolvers as needed
};