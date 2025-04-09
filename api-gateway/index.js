const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

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
  
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API Gateway running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
