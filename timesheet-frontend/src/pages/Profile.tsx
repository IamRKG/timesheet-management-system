import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Layout } from '../components/layout';
import { Alert } from '../components/ui/alert';
import { Spinner } from '../components/ui/spinner';
import { useAuthStore } from '../store/authStore';

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || ''
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="My Profile">
      <div className="mx-auto max-w-2xl">
        {error && (
          <Alert 
            variant="error" 
            className="mb-6"
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            variant="success" 
            className="mb-6"
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        
        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-navy-700">Personal Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Engineering, Marketing, etc."
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/change-password')}
              >
                Change Password
              </Button>
              
              <Button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" variant="white" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          <h3 className="font-medium text-gray-900">Account Information</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span>Role:</span>
              <span className="font-medium">{user?.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Account Created:</span>
              <span className="font-medium">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}