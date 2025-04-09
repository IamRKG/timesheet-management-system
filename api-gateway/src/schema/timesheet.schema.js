const { gql } = require('apollo-server-express');

module.exports = gql`
  type TimeSheet {
    id: ID!
    userId: ID!
    weekStarting: String!
    weekEnding: String!
    status: String!
    totalHours: Float!
    submittedAt: String
    approvedAt: String
    approvedBy: ID
    rejectedAt: String
    rejectedBy: ID
    comments: String
    entries: [TimeEntry]
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    timeSheet(id: ID!): TimeSheet
    myTimeSheets: [TimeSheet]
    pendingApprovals: [TimeSheet]
  }

  extend type Mutation {
    createTimeSheet(weekStarting: String!): TimeSheet!
    submitTimeSheet(id: ID!): TimeSheet!
    approveTimeSheet(id: ID!, comments: String): TimeSheet!
    rejectTimeSheet(id: ID!, comments: String!): TimeSheet!
  }
`;
