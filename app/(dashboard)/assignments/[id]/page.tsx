import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { AssignmentDetailView } from '@/components/assignments/AssignmentDetailView';
import { getAssignment } from '@/features/assignments/assignment.service';
import { paperRepository } from '@/repositories/paper.repository';

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: AssignmentDetailPageProps,
): Promise<Metadata> {
  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) return { title: 'Assignment Not Found' };
  return {
    title: assignment.title,
    description: `View assignment details for "${assignment.title}"`,
  };
}

export default async function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { id } = await params;

  const [assignment, paper] = await Promise.all([
    getAssignment(id),
    paperRepository.findByAssignmentId(id),
  ]);

  if (!assignment) {
    notFound();
  }

  return (
    <>
      <Header
        title={assignment.title}
        showBack
        backHref="/assignments"
        subtitle="Assignment Details"
      />
      <main className="page-body">
        <AssignmentDetailView
          assignment={JSON.parse(JSON.stringify(assignment))}
          paper={paper ? JSON.parse(JSON.stringify(paper)) : null}
        />
      </main>
    </>
  );
}
