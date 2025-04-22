const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const net = require('net');
require('dotenv').config();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        resolve(true); // Port is in use
      })
      .once('listening', () => {
        server.close();
        resolve(false); // Port is available
      })
      .listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort, maxAttempts = 10) {
  let port = startPort;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    port++;
    attempts++;
  }
  
  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

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
      return { token };
    },
  });
  
  await server.start();
  server.applyMiddleware({ app });
  
  // Find an available port starting from the preferred port
  const preferredPort = parseInt(process.env.PORT || '4000', 10);
  const PORT = await findAvailablePort(preferredPort);
  
  app.listen(PORT, () => {
    console.log(`API Gateway running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});