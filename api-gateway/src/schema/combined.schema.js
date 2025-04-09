const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type TimeEntry {
    id: ID!
    userId: ID!
    date: String!
    hours: Float!
    description: String!
    project: String!
    createdAt: String!
    updatedAt: String!
  }

  type TimeSheet {
    id: ID!
    userId: ID!
    weekStarting: String!
    status: String!
    totalHours: Float!
    submittedAt: String
    approvedAt: String
    approvedBy: ID
    comments: String
    createdAt: String!
    updatedAt: String!
    timeEntries: [TimeEntry]
  }

  type Notification {
    id: ID!
    userId: ID!
    type: String!
    title: String!
    message: String!
    relatedId: ID
    isRead: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users: [User]
    
    # TimeSheet queries
    timeSheet(id: ID!): TimeSheet
    myTimeSheets: [TimeSheet]
    pendingApprovals: [TimeSheet]
    
    # TimeEntry queries
    timeEntry(id: ID!): TimeEntry
    myTimeEntries(startDate: String, endDate: String): [TimeEntry]
    
    # Report queries
    departmentReport(startDate: String!, endDate: String!): String
    projectReport(startDate: String!, endDate: String!): String
    
    # Notification queries
    myNotifications: [Notification]
  }

  type Mutation {
    # User mutations
    register(name: String!, email: String!, password: String!, role: String): User
    login(email: String!, password: String!): String
    
    # TimeEntry mutations
    createTimeEntry(date: String!, hours: Float!, description: String!, project: String!): TimeEntry
    updateTimeEntry(id: ID!, date: String, hours: Float, description: String, project: String): TimeEntry
    deleteTimeEntry(id: ID!): Boolean
    
    # TimeSheet mutations
    createTimeSheet(weekStarting: String!): TimeSheet
    submitTimeSheet(id: ID!): TimeSheet
    approveTimeSheet(id: ID!, comments: String): TimeSheet
    rejectTimeSheet(id: ID!, comments: String!): TimeSheet
    
    # Notification mutations
    markNotificationAsRead(id: ID!): Boolean
    markAllNotificationsAsRead: Boolean
    deleteNotification(id: ID!): Boolean
  }
`;
