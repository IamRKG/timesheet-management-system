const gql = require('../utils/gql');
module.exports = gql`
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
  
  type AuthPayload {
    token: String!
    user: User!
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
  
  extend type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
  }
  
  extend type Mutation {
    register(input: UserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UserUpdateInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
  }
`;