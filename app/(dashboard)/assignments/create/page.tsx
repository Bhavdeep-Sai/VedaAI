import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { CreateAssignmentForm } from '@/components/create/CreateAssignmentForm';

export const metadata: Metadata = {
  title: 'Create Assignment',
  description: 'Create a new AI-powered assignment by uploading your study material.',
};

export default function CreateAssignmentPage() {
  return (
    <>
      <Header
        title="Create Assignment"
        showBack
        backHref="/assignments"
      />
      <main className="page-body">
        <CreateAssignmentForm />
      </main>
    </>
  );
}
