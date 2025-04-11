import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  department?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(API_URL, {
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
              user {
                id
                email
                firstName
                lastName
                role
                department
              }
            }
          }
        `,
        variables: {
          email: credentials.email,
          password: credentials.password,
        },
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.login;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(API_URL, {
        query: `
          mutation Register($input: UserInput!) {
            register(input: $input) {
              token
              user {
                id
                email
                firstName
                lastName
                role
                department
              }
            }
          }
        `,
        variables: {
          input: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            department: userData.department || null,
          },
        },
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.register;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            query Me {
              me {
                id
                email
                firstName
                lastName
                role
                department
              }
            }
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.me;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user data');
    }
  }

  async updateUserProfile(token: string, userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
              updateUser(id: $id, input: $input) {
                id
                email
                firstName
                lastName
                role
                department
              }
            }
          `,
          variables: {
            id: userId,
            input: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              department: userData.department,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.updateUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  }

  async changePassword(token: string, userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            mutation ChangePassword($id: ID!, $currentPassword: String!, $newPassword: String!) {
              changePassword(id: $id, currentPassword: $currentPassword, newPassword: $newPassword)
            }
          `,
          variables: {
            id: userId,
            currentPassword,
            newPassword,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.changePassword;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
    }
  }

  // For admin/manager use
  async getUsers(token: string): Promise<User[]> {
    try {
      const response = await axios.post(
        API_URL,
        {
          query: `
            query GetUsers {
              users {
                id
                email
                firstName
                lastName
                role
                department
              }
            }
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.users;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
  }
}

export const authService = new AuthService();
