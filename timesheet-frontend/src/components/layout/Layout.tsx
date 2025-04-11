import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function Layout({ children, title, showBackButton, backUrl }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={title} showBackButton={showBackButton} backUrl={backUrl} />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
