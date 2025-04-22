const { gql } = require('apollo-server-express');

module.exports = gql`
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
    createdAt: String
    updatedAt: String
  }
  input TimeEntryInput {
    date: String!
    startTime: String!
    endTime: String
    project: String
    description: String
  }

  extend type Query {
    timeEntry(id: ID!): TimeEntry
    myTimeEntries(startDate: String, endDate: String): [TimeEntry]
  }

  extend type Mutation {
    createTimeEntry(input: TimeEntryInput!): TimeEntry!
    updateTimeEntry(id: ID!, input: TimeEntryInput!): TimeEntry!
    deleteTimeEntry(id: ID!): Boolean!
  }
`;