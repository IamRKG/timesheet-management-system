#!/bin/bash

# Start all services in development mode
echo "Starting Auth Service..."
cd services/auth-service && npm run dev &
AUTH_PID=$!

echo "Starting Timesheet Service..."
cd services/timesheet-service && npm run dev &
TIMESHEET_PID=$!

echo "Starting Notification Service..."
cd services/notification-service && npm run dev &
NOTIFICATION_PID=$!

echo "Starting API Gateway..."
cd api-gateway && npm run dev &
GATEWAY_PID=$!

# Wait for all processes
wait $AUTH_PID $TIMESHEET_PID $NOTIFICATION_PID $GATEWAY_PID
