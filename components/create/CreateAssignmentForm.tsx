'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ChevronLeft, ChevronRight, Mic, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { StepIndicator } from './StepIndicator';
import { FileUploadZone } from './FileUploadZone';
import { QuestionTypeRow } from './QuestionTypeRow';
import { GenerationProgress } from '@/components/shared/GenerationProgress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAssignmentStore } from '@/stores/assignment.store';
import { useGenerationStore } from '@/stores/generation.store';
import type { QuestionTypeConfig } from '@/types/assignment.types';
import { Step1Schema, Step2Schema, Step3Schema } from '@/schemas/assignment.schema';

// ─── Validation Schemas ────────────────────────────────────────────────────

type Step1Data = z.infer<typeof Step1Schema>;
type Step2Data = z.infer<typeof Step2Schema>;
type Step3Data = z.infer<typeof Step3Schema>;

// ─── Component ─────────────────────────────────────────────────────────────

const DEFAULT_QUESTION_TYPE: QuestionTypeConfig = {
  type: 'Short Answer Questions',
  count: 5,
  marksPerQuestion: 2,
};

export function CreateAssignmentForm() {
  const router = useRouter();
  const { createAssignment, isCreating } = useAssignmentStore();
  const { startGeneration, isGenerating, hasCompleted, hasFailed, paper } = useGenerationStore();

  const [step, setStep] = useState(1);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [fileData, setFileData] = useState<Step1Data | null>(null);

  // Step 1 Form
  const step1 = useForm<Step1Data>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      title: '',
      fileUrl: '',
      fileName: '',
      fileType: 'pdf',
      fileSize: 0,
      fileContent: '',
      wordCount: 0,
    },
  });

  // Step 2 Form
  const step2 = useForm<Step2Data>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      dueDate: '',
      questionTypes: [DEFAULT_QUESTION_TYPE],
      additionalInstructions: '',
    },
  });

  // Step 3 Form
  const step3 = useForm<Step3Data>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      schoolName: '',
      className: '',
      subject: '',
      timeAllowed: '',
      headerLayout: 'layout-1',
    },
  });

  const questionTypes = step2.watch('questionTypes');
  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marksPerQuestion,
    0,
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback(
    (data: {
      fileUrl: string;
      fileName: string;
      fileType: 'pdf' | 'txt';
      fileSize: number;
      extractedText: string;
      wordCount: number;
    }) => {
      step1.setValue('fileUrl', data.fileUrl);
      step1.setValue('fileName', data.fileName);
      step1.setValue('fileType', data.fileType);
      step1.setValue('fileSize', data.fileSize);
      step1.setValue('fileContent', data.extractedText);
      step1.setValue('wordCount', data.wordCount);
      step1.clearErrors('fileUrl');
    },
    [step1],
  );

  const handleFileClear = () => {
    step1.setValue('fileUrl', '');
    step1.setValue('fileName', '');
    step1.setValue('fileSize', 0);
    step1.setValue('fileContent', '');
  };

  const handleStep1Next = step1.handleSubmit(async (rawData) => {
    // Cast needed: handleSubmit returns FieldValues but our schema guarantees Step1Data shape
    const data = rawData as unknown as Step1Data;
    setFileData(data);
    setStep(2);
  });

  const handleStep2Submit = step2.handleSubmit(async () => {
    setStep(3);
  });

  const handleStep3Submit = step3.handleSubmit(async (data) => {
    if (!fileData) return;
    const step2Data = step2.getValues();

    try {
      // dueDate is in YYYY-MM-DD format from native date input
      const isoDate = new Date(step2Data.dueDate).toISOString();

      const id = await createAssignment({
        title: fileData.title,
        dueDate: isoDate,
        fileUrl: fileData.fileUrl || '',
        fileName: fileData.fileName || '',
        fileType: fileData.fileType || '',
        fileSize: fileData.fileSize || 0,
        fileContent: fileData.fileContent || '',
        questionTypes: step2Data.questionTypes,
        additionalInstructions: step2Data.additionalInstructions,
        schoolName: data.schoolName,
        className: data.className,
        subject: data.subject,
        timeAllowed: data.timeAllowed,
        headerLayout: data.headerLayout,
      });

      setAssignmentId(id);
      setStep(4);

      // Start generation
      await startGeneration(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create assignment');
    }
  });

  const handleAddQuestionType = () => {
    const current = step2.getValues('questionTypes');
    step2.setValue('questionTypes', [
      ...current,
      { type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 1 },
    ]);
  };

  const handleUpdateQuestionType = (index: number, updated: QuestionTypeConfig) => {
    const current = step2.getValues('questionTypes');
    const next = [...current];
    next[index] = updated;
    step2.setValue('questionTypes', next);
  };

  const handleRemoveQuestionType = (index: number) => {
    const current = step2.getValues('questionTypes');
    step2.setValue(
      'questionTypes',
      current.filter((_, i) => i !== index),
    );
  };

  const handleViewPaper = useCallback(() => {
    if (assignmentId) {
      router.push(`/assignments/${assignmentId}`);
    }
  }, [assignmentId, router]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-3xl w-full mx-auto h-full flex flex-col overflow-x-hidden">
      {/* ── Step Indicator ────────────────────────────────────── */}
      <div className="flex-shrink-0 mb-4 md:mb-6 pt-4 px-2 sm:px-4 md:px-0 w-full">
        <StepIndicator totalSteps={4} currentStep={step} />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 md:px-6 lg:px-8 pb-6 md:pb-8 flex flex-col w-full">
        <div className="my-auto space-y-4 md:space-y-6 w-full">
          {/* ── Page Title ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {step === 1 && 'Create Assignment'}
                {step === 2 && 'Assignment Details'}
                {step === 3 && 'Header & Layout'}
                {step === 4 && 'Generating Question Paper'}
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {step === 1 && 'Upload your study material'}
              {step === 2 && 'Set up a new assignment for your students'}
              {step === 3 && 'Configure the question paper header and layout'}
              {step === 4 && 'Please wait while AI generates your question paper'}
            </p>
          </div>

          {/* ── STEP 1: Title + Upload ────────────────────────────── */}
        {step === 1 && (
          <div className="card p-4 sm:p-5 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="title" required>Assignment Title</Label>
              <Input
                id="title"
                placeholder="e.g. Quiz on Electricity"
                {...step1.register('title')}
                error={step1.formState.errors.title?.message}
              />
            </div>

            <div className="space-y-2">
              <FileUploadZone
                onUploadSuccess={handleFileUpload}
                currentFile={
                  step1.watch('fileUrl')
                    ? {
                        name: step1.watch('fileName') || '',
                        size: step1.watch('fileSize') || 0,
                        type: step1.watch('fileType') || '',
                      }
                    : null
                }
                onClear={handleFileClear}
              />
              {step1.formState.errors.fileUrl && (
                <p className="text-xs text-[var(--danger)]">
                  {step1.formState.errors.fileUrl.message}
                </p>
              )}
            </div>

            {(step1.watch('wordCount') || 0) > 0 && (
              <p className="text-xs text-[var(--text-muted)]">
                ✓ Extracted {(step1.watch('wordCount') || 0).toLocaleString()} words from document
              </p>
            )}

            <div className="flex justify-center md:justify-end pt-6">
              <Button type="button" variant="dark-pill" size="md" onClick={handleStep1Next} className="gap-2 px-8">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Assignment Configuration ─────────────────── */}
        {step === 2 && (
          <div className="card p-4 sm:p-6 space-y-4 sm:space-y-5 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" required>Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...step2.register('dueDate')}
                error={step2.formState.errors.dueDate?.message}
                className="[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>

          {/* Question Types */}
          <div className="space-y-3">
            {/* Column Headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center text-xs font-medium text-[var(--text-secondary)] pb-1 border-b border-[var(--border-default)]">
              <span>Question Type</span>
              <span className="w-7" />
              <span className="text-center w-20">No. of Questions</span>
              <span className="text-center w-20">Marks</span>
            </div>

            <Controller
              control={step2.control}
              name="questionTypes"
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value.map((qt, index) => (
                    <QuestionTypeRow
                      key={index}
                      index={index}
                      value={qt}
                      onChange={(updated) => handleUpdateQuestionType(index, updated)}
                      onRemove={() => handleRemoveQuestionType(index)}
                      canRemove={field.value.length > 1}
                    />
                  ))}
                </div>
              )}
            />

            {step2.formState.errors.questionTypes && (
              <p className="text-xs text-[var(--danger)]">
                {step2.formState.errors.questionTypes.message}
              </p>
            )}

            {/* Add Question Type */}
            <button
              type="button"
              onClick={handleAddQuestionType}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-brand transition-colors py-1"
            >
              <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </div>
              Add Question Type
            </button>

            {/* Totals */}
            <div className="text-right text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-default)]">
              <div>Total Questions : <span className="font-semibold text-[var(--text-primary)]">{totalQuestions}</span></div>
              <div>Total Marks : <span className="font-semibold text-[var(--text-primary)]">{totalMarks}</span></div>
            </div>
          </div>

          {/* Additional Instructions */}
          <div className="space-y-1.5">
            <Label htmlFor="instructions">Additional Information (For better output)</Label>
            <div className="relative">
              <Textarea
                id="instructions"
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                rows={3}
                {...step2.register('additionalInstructions')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute bottom-3 right-3 text-[var(--text-muted)] hover:text-brand transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center md:justify-between items-center gap-4 pt-6 md:pt-2 pb-6 md:pb-0">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setStep(1)}
              className="gap-2 rounded-full bg-white md:bg-transparent border border-[var(--border-default)] shadow-sm md:shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="dark-pill"
              size="md"
              onClick={handleStep2Submit}
              loading={isCreating}
              className="gap-2 px-8"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Header Details & Layout ─────────────────── */}
      {step === 3 && (
        <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-0.5">
              Header Details
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure how the header of your question paper will look
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName" required>School Name</Label>
              <Input id="schoolName" placeholder="e.g. Delhi Public School" {...step3.register('schoolName')} error={step3.formState.errors.schoolName?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="className" required>Class & Section</Label>
              <Input id="className" placeholder="e.g. Class 10 A" {...step3.register('className')} error={step3.formState.errors.className?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject" required>Subject</Label>
              <Input id="subject" placeholder="e.g. Science" {...step3.register('subject')} error={step3.formState.errors.subject?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeAllowed" required>Time Allowed</Label>
              <Input id="timeAllowed" placeholder="e.g. 2 Hours" {...step3.register('timeAllowed')} error={step3.formState.errors.timeAllowed?.message} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label required>Header Layout Preview</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((layoutNum) => {
                const layoutKey = `layout-${layoutNum}` as "layout-1" | "layout-2" | "layout-3";
                const isSelected = step3.watch('headerLayout') === layoutKey;
                return (
                  <div
                    key={layoutKey}
                    onClick={() => step3.setValue('headerLayout', layoutKey)}
                    className={`cursor-pointer border rounded-md p-3 transition-colors ${isSelected ? 'border-brand bg-brand/5' : 'border-[var(--border-default)] hover:border-brand/50'}`}
                  >
                    <div className="text-center font-bold text-xs mb-1">
                      {step3.watch('schoolName') || 'School Name'}
                    </div>
                    {layoutNum === 1 && (
                      <div className="flex flex-col gap-0.5 text-[10px] text-[var(--text-secondary)]">
                        <div className="flex justify-between">
                          <span>{step3.watch('subject') || 'Subject'}</span>
                          <span>{step3.watch('className') || 'Class'}</span>
                          <span>{step3.watch('timeAllowed') || 'Time'}</span>
                        </div>
                        <div className="flex justify-end">
                          <span>Max Marks: {totalMarks}</span>
                        </div>
                      </div>
                    )}
                    {layoutNum === 2 && (
                      <div className="text-center text-[10px] text-[var(--text-secondary)]">
                        <div>{step3.watch('subject') || 'Subject'} - {step3.watch('className') || 'Class'}</div>
                        <div className="mt-0.5">Time: {step3.watch('timeAllowed') || 'Time'} | Max Marks: {totalMarks}</div>
                      </div>
                    )}
                    {layoutNum === 3 && (
                      <div className="flex flex-col gap-0.5 text-[10px] text-[var(--text-secondary)]">
                        <div className="flex justify-between">
                          <span>Class: {step3.watch('className') || 'Class'}</span>
                          <span>Time: {step3.watch('timeAllowed') || 'Time'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subject: {step3.watch('subject') || 'Subject'}</span>
                          <span>Max Marks: {totalMarks}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center md:justify-between items-center gap-4 pt-6 md:pt-2 pb-6 md:pb-0">
            <Button type="button" variant="ghost" size="md" onClick={() => setStep(2)} className="gap-2 rounded-full bg-white md:bg-transparent border border-[var(--border-default)] shadow-sm md:shadow-none">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button type="button" variant="dark-pill" size="md" onClick={handleStep3Submit} loading={isCreating} className="gap-2 px-8">
              Generate
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Generation Progress ──────────────────────── */}
      {step === 4 && assignmentId && (
        <GenerationProgress
          assignmentId={assignmentId}
          onViewPaper={handleViewPaper}
          onRetry={() => {
            if (assignmentId) startGeneration(assignmentId);
          }}
        />
      )}
        </div>
      </div>
    </div>
    </>
  );
}
