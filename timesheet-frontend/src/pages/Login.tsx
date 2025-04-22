import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert } from '../components/ui/alert';
import { Spinner } from '../components/ui/spinner';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: storeError, token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check for redirect messages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
    
    if (message === 'logout') {
      setSuccessMessage('You have been successfully logged out.');
    } else if (message === 'registered') {
      setSuccessMessage('Registration successful! Please log in with your new account.');
    }
    
    // Redirect to dashboard if already logged in
    if (token) {
      navigate('/dashboard');
    }
  }, [location, navigate, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-navy-700">Welcome Back</h1>          <p className="mt-2 text-gray-600">
            Sign in to your timesheet management account
          </p>
        </div>

        <div className="card">
          {(error || storeError) && (
            <Alert 
              variant="error" 
              className="mb-6"
              onClose={() => setError('')}
            >
              {error || storeError}
            </Alert>
          )}

          {successMessage && (
            <Alert 
              variant="success" 
              className="mb-6"
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your.email@example.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-xs text-navy-600 hover:text-navy-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" variant="white" className="mr-2" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-navy-600 hover:text-navy-800 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}