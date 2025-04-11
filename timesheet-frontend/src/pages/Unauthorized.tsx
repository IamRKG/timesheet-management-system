import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function Unauthorized() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
