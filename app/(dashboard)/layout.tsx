import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout print:block">
      <Sidebar />
      <div className="main-content print:block print:ml-0">
        {children}
      </div>
    </div>
  );
}
