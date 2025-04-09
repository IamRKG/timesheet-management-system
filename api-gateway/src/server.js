const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const createServices = require('./services/index');

// Load environment variables
require('dotenv').config();

// Debug: Log resolver keys
console.log('Query resolver keys:', Object.keys(resolvers.Query || {}));
console.log('Mutation resolver keys:', Object.keys(resolvers.Mutation || {}));

async function startApolloServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Enable CORS
  app.use(cors());

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Get auth token from request headers
      const token = req.headers.authorization?.split(' ')[1] || '';

      // Verify token and extract user data
      let user = null;
      if (token) {
        try {
          user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
          console.error('Invalid token:', error.message);
        }
      }

      // Create service instances
      const services = createServices(req);

      return { user, services };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error('GraphQL Error:', error);

      // Return a more user-friendly error message
      return {
        message: error.message,
        path: error.path,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
        }
      };
    },
    introspection: true, // Ensure introspection is enabled
    playground: true
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  server.applyMiddleware({ app });

  // Add health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Start HTTP server
  const PORT = process.env.PORT || 4000;
  await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));

  console.log(`🚀 API Gateway ready at http://localhost:${PORT}${server.graphqlPath}`);

  return { server, app, httpServer };
}

// Start the server
startApolloServer().catch(error => {
  console.error('Failed to start server:', error);
});
