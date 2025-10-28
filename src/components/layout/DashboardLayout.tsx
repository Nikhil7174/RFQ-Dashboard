import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
