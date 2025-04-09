const { gql } = require('apollo-server-express');

console.log('Loading notification schema...');

module.exports = gql`
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

  extend type Query {
    myNotifications: [Notification]
  }

  extend type Mutation {
    markNotificationAsRead(id: ID!): Boolean
    markAllNotificationsAsRead: Boolean
    deleteNotification(id: ID!): Boolean
  }
`;
