import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './layout/Header';

interface LayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
  actions?: ReactNode;
}

export function Layout({ children, title, showBackButton, backUrl }: LayoutProps) {

 

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} showBackButton={showBackButton} backUrl={backUrl} />
     

      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
