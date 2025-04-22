const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios'); // Add this import
const jwt = require('jsonwebtoken'); // Also add this for token verification
require('dotenv').config();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const TIMESHEET_SERVICE = process.env.TIMESHEET_SERVICE_URL || 'http://localhost:4002';
const REPORTING_SERVICE = process.env.REPORTING_SERVICE_URL || 'http://localhost:4003';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004';

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }));
  app.use(express.json());
  
  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Extract auth token from headers
      const token = req.headers.authorization || '';
      
      // Create a user object if token exists
      let user = null;
      if (token) {
        try {
          // This is a simplified example - in production, you'd verify the token
          // and extract the user information
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          user = { id: decoded.id }; // Make sure this matches what the timesheet service expects
        } catch (error) {
          console.error('Invalid token:', error.message);
        }
      }
      
      // Create service objects for making requests to microservices
      const services = {
        authService: axios.create({ baseURL: AUTH_SERVICE }),
        timesheetService: axios.create({ baseURL: TIMESHEET_SERVICE }),
        reportingService: axios.create({ baseURL: REPORTING_SERVICE }),
        notificationService: axios.create({ baseURL: NOTIFICATION_SERVICE }),
        getAuthToken: () => token
      };
      
      return { token, user, services };
    },  });
  
  await server.start();
  server.applyMiddleware({ app });
  
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API Gateway running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();