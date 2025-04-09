const userResolver = require('./user.resolver');
const timeEntryResolver = require('./timeEntry.resolver');
const timesheetResolver = require('./timesheet.resolver');
const notificationResolver = require('./notification.resolver');

// Log the contents of each resolver to debug
console.log('User resolver Query:', Object.keys(userResolver.Query || {}));
console.log('TimeEntry resolver Query:', Object.keys(timeEntryResolver.Query || {}));
console.log('Timesheet resolver Query:', Object.keys(timesheetResolver.Query || {}));
console.log('Notification resolver Query:', Object.keys(notificationResolver.Query || {}));

// Merge all resolvers into a single object
const mergedResolvers = {
  Query: {
    ...(userResolver.Query || {}),
    ...(timeEntryResolver.Query || {}),
    ...(timesheetResolver.Query || {}),
    ...(notificationResolver.Query || {})
  },
  Mutation: {
    ...(userResolver.Mutation || {}),
    ...(timeEntryResolver.Mutation || {}),
    ...(timesheetResolver.Mutation || {}),
    ...(notificationResolver.Mutation || {})
  }
};

console.log('Final merged Query keys:', Object.keys(mergedResolvers.Query));

module.exports = mergedResolvers;