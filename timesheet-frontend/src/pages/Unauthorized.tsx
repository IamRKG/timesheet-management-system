import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Layout title="Access Denied">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-red-100 p-6 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-navy-700 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <Button 
          className="bg-navy-600 text-white hover:bg-navy-700"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    </Layout>
  );
}
