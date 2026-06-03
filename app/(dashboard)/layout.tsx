import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MainContent } from '@/components/layout/MainContent';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout print:block">
      <MobileHeader />
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
      <MobileBottomNav />
    </div>
  );
}
