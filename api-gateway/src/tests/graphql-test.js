const axios = require('axios');

// GraphQL API endpoint
const API_URL = 'http://localhost:4000/graphql';

// Test user credentials
const credentials = {
  email: 'test@example.com',
  password: 'password123'
};

// GraphQL queries and mutations
const queries = {
  login: `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          name
          email
          role
        }
      }
    }
  `,
  createTimeEntry: `
    mutation CreateTimeEntry($input: TimeEntryInput!) {
      createTimeEntry(input: $input) {
        id
        date
        startTime
        endTime
        project
        description
        status
      }
    }
  `,
  myTimeEntries: `
    query MyTimeEntries {
      myTimeEntries {
        id
        date
        startTime
        endTime
        project
        description
        status
      }
    }
  `,
  createTimeSheet: `
    mutation CreateTimeSheet($weekStarting: String!) {
      createTimeSheet(weekStarting: $weekStarting) {
        id
        weekStarting
        weekEnding
        status
        totalHours
      }
    }
  `,
  submitTimeSheet: `
    mutation SubmitTimeSheet($id: ID!) {
      submitTimeSheet(id: $id) {
        id
        status
        submittedAt
      }
    }
  `,
  myNotifications: `
    query MyNotifications {
      myNotifications {
        id
        type
        title
        message
        isRead
        createdAt
      }
    }
  `
};

// Run tests
async function runTests() {
  try {
    console.log('Starting GraphQL API tests...');
    
    // Step 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(API_URL, {
      query: queries.login,
      variables: credentials
    });
    
    if (loginResponse.data.errors) {
      throw new Error(`Login failed: ${loginResponse.data.errors[0].message}`);
    }
    
    const { token, user } = loginResponse.data.data.login;
    console.log(`Login successful for user: ${user.name} (${user.role})`);
    
    // Set auth header for subsequent requests
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    // Step 2: Create a time entry
    console.log('\n2. Creating a time entry...');
    const timeEntryInput = {
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      project: 'API Development',
      description: 'Working on GraphQL API'
    };
    
    const createTimeEntryResponse = await axios.post(API_URL, {
      query: queries.createTimeEntry,
      variables: { input: timeEntryInput }
    }, { headers });
    
    if (createTimeEntryResponse.data.errors) {
      throw new Error(`Create time entry failed: ${createTimeEntryResponse.data.errors[0].message}`);
    }
    
    const timeEntry = createTimeEntryResponse.data.data.createTimeEntry;
    console.log(`Time entry created with ID: ${timeEntry.id}`);
    
    // Step 3: Get my time entries
    console.log('\n3. Fetching time entries...');
    const myTimeEntriesResponse = await axios.post(API_URL, {
      query: queries.myTimeEntries
    }, { headers });
    
    if (myTimeEntriesResponse.data.errors) {
      throw new Error(`Fetch time entries failed: ${myTimeEntriesResponse.data.errors[0].message}`);
    }
    
    const timeEntries = myTimeEntriesResponse.data.data.myTimeEntries;
    console.log(`Found ${timeEntries.length} time entries`);
    
    // Step 4: Create a timesheet
    console.log('\n4. Creating a timesheet...');
    const today = new Date();
    const weekStarting = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0];
    
    const createTimeSheetResponse = await axios.post(API_URL, {
      query: queries.createTimeSheet,
      variables: { weekStarting }
    }, { headers });
    
    if (createTimeSheetResponse.data.errors) {
      throw new Error(`Create timesheet failed: ${createTimeSheetResponse.data.errors[0].message}`);
    }
    
    const timesheet = createTimeSheetResponse.data.data.createTimeSheet;
    console.log(`Timesheet created with ID: ${timesheet.id}`);
    
    // Step 5: Submit the timesheet
    console.log('\n5. Submitting the timesheet...');
    const submitTimeSheetResponse = await axios.post(API_URL, {
      query: queries.submitTimeSheet,
      variables: { id: timesheet.id }
    }, { headers });
    
    if (submitTimeSheetResponse.data.errors) {
      throw new Error(`Submit timesheet failed: ${submitTimeSheetResponse.data.errors[0].message}`);
    }
    
    const submittedTimesheet = submitTimeSheetResponse.data.data.submitTimeSheet;
    console.log(`Timesheet submitted with status: ${submittedTimesheet.status}`);
    
    // Step 6: Check notifications
    console.log('\n6. Checking notifications...');
    const myNotificationsResponse = await axios.post(API_URL, {
      query: queries.myNotifications
    }, { headers });
    
    if (myNotificationsResponse.data.errors) {
      throw new Error(`Fetch notifications failed: ${myNotificationsResponse.data.errors[0].message}`);
    }
    
    const notifications = myNotificationsResponse.data.data.myNotifications;
    console.log(`Found ${notifications.length} notifications`);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

runTests();
