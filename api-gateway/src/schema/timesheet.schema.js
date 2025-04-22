const { gql } = require('apollo-server-express');

module.exports = gql`
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
  
  extend type Query {
    timeSheet(id: ID!): TimeSheet
    myTimeSheets(status: String): [TimeSheet!]!
    pendingApprovals: [TimeSheet!]!
  }
  
  extend type Mutation {
    createTimeSheet(weekStarting: String!): TimeSheet!
    submitTimeSheet(id: ID!): TimeSheet!
    approveTimeSheet(id: ID!, comments: String): TimeSheet!
    rejectTimeSheet(id: ID!, comments: String!): TimeSheet!
  }
`;