import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { AssignmentGrid } from '@/components/assignments/AssignmentGrid';

export const metadata: Metadata = {
  title: 'Assignments',
  description: 'View and manage all your AI-generated assignments.',
};

export default function AssignmentsPage() {
  return (
    <>
      <Header title="Assignments" showDot />
      <main className="page-body">
        <AssignmentGrid />
      </main>
    </>
  );
}
