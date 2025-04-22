const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    departmentReport(department: String!, startDate: String!, endDate: String!): [TimeSheet!]!
    projectReport(project: String!, startDate: String!, endDate: String!): [TimeEntry!]!
  }
`;