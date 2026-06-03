import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { GeneratedPaperPage } from '@/components/paper/GeneratedPaperPage';
import { paperRepository } from '@/repositories/paper.repository';
import { getAssignment } from '@/features/assignments/assignment.service';

interface GeneratedPaperPageProps {
  params: Promise<{ assignmentId: string }>;
}

export async function generateMetadata(
  { params }: GeneratedPaperPageProps,
): Promise<Metadata> {
  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return { title: 'Question Paper Not Found' };
  return {
    title: `Question Paper — ${assignment.title}`,
    description: `Generated question paper for ${assignment.title}`,
  };
}

export default async function GeneratedPaperPageRoute({
  params,
}: GeneratedPaperPageProps) {
  const { assignmentId } = await params;

  const [assignment, paper] = await Promise.all([
    getAssignment(assignmentId),
    paperRepository.findByAssignmentId(assignmentId),
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
        subtitle="Generated Question Paper"
      />
      <main className="page-body">
        <GeneratedPaperPage
          assignment={JSON.parse(JSON.stringify(assignment))}
          paper={paper ? JSON.parse(JSON.stringify(paper)) : null}
          assignmentId={assignmentId}
        />
      </main>
    </>
  );
}
