/**
 * @deprecated This monolithic schema is being replaced by modular schemas in src/schema/
 * Please use the modular schema files for any new development.
 */
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Common types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    department: String
    createdAt: String!
    updatedAt: String!
  }
  
  type TimeEntry {
    id: ID!
    userId: ID!
    date: String!
    startTime: String!
    endTime: String
    duration: Float
    project: String
    description: String
    status: String!
    timesheetId: ID
    createdAt: String!
    updatedAt: String!
  }  
  type TimeSheet {
    id: ID!
    userId: ID!
    weekStarting: String!
    status: String!
    totalHours: Float!
    entries: [TimeEntry!]!
    submittedAt: String
    approvedAt: String
    approvedBy: ID
    comments: String
    createdAt: String!
    updatedAt: String!
  }
  
  type AuthPayload {
    token: String!
    user: User!
  }
  
  # Inputs
  input TimeEntryInput {
    date: String!
    startTime: String!
    endTime: String
    project: String
    description: String
  }
  
  input UserInput {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    role: String!
    department: String
  }

  input UserUpdateInput {
    firstName: String
    lastName: String
    email: String
    department: String
  }
  
  # Queries
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users: [User!]!
    
    # TimeSheet queries
    timeSheet(id: ID!): TimeSheet
    myTimeSheets(status: String): [TimeSheet!]!
    pendingApprovals: [TimeSheet!]!
    
    # TimeEntry queries
    timeEntry(id: ID!): TimeEntry
    myTimeEntries(startDate: String!, endDate: String!): [TimeEntry!]!
    
    # Reporting
    departmentReport(department: String!, startDate: String!, endDate: String!): [TimeSheet!]!
    projectReport(project: String!, startDate: String!, endDate: String!): [TimeEntry!]!
  }
  
  # Mutations
  type Mutation {
    # Auth mutations
    register(input: UserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UserUpdateInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    
    # TimeEntry mutations
    createTimeEntry(input: TimeEntryInput!): TimeEntry!
    updateTimeEntry(id: ID!, input: TimeEntryInput!): TimeEntry!
    deleteTimeEntry(id: ID!): Boolean!
    
    # TimeSheet mutations
    createTimeSheet(weekStarting: String!): TimeSheet!
    submitTimeSheet(id: ID!): TimeSheet!
    approveTimeSheet(id: ID!, comments: String): TimeSheet!
    rejectTimeSheet(id: ID!, comments: String!): TimeSheet!
  }`;
module.exports = typeDefs;