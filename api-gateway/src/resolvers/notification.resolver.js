const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ensureId } = require('../utils/transformers');

console.log('Loading notification resolver...');

// Rest of the file remains the same



// Get all notifications for the current user
const myNotifications = async (_, __, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to view notifications');
    }
    
    const response = await services.notificationService.get('/api/notifications/my', {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch notifications'
    );
  }
};

// Mark a notification as read
const markNotificationAsRead = async (_, { id }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to update notifications');
    }
    
    await services.notificationService.put(`/api/notifications/${id}/read`, {}, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to mark notification as read'
    );
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (_, __, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to update notifications');
    }
    
    await services.notificationService.put('/api/notifications/read-all', {}, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to mark all notifications as read'
    );
  }
};

// Delete a notification
const deleteNotification = async (_, { id }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to delete notifications');
    }
    
    await services.notificationService.delete(`/api/notifications/${id}`, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to delete notification'
    );
  }
};

module.exports = {
  Query: {
    myNotifications
  },
  Mutation: {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  }
};
