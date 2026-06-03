'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Check } from 'lucide-react';
import { AssignmentCard } from './AssignmentCard';
import { EmptyState } from './EmptyState';
import { AssignmentGridSkeleton } from '@/components/ui/skeleton';
import { useAssignmentStore } from '@/stores/assignment.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AssignmentGrid() {
  const { assignments, isLoading, fetchAssignments, searchQuery, setSearchQuery } =
    useAssignmentStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    fetchAssignments();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
    if (e.target.value === '') {
      setSearchQuery('');
      fetchAssignments();
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="flex flex-col h-full relative animate-fade-in">
      {/* ── Filter/Search Bar ─────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[var(--bg-main)] md:bg-transparent pt-0 pb-3 md:py-0 px-4 md:px-0 z-30 md:mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white md:bg-transparent rounded-2xl md:rounded-none p-2 px-3 md:p-0 shadow-sm md:shadow-none w-full md:max-w-md border border-[var(--border-default)] md:border-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 flex-shrink-0 px-2 text-[var(--text-secondary)] md:text-[var(--text-primary)] hover:bg-transparent border-none bg-transparent h-auto py-1"
              >
                <Filter className="w-4 h-4 md:w-3.5 md:h-3.5" />
                <span className="hidden md:inline">
                  {statusFilter === 'all' ? 'Filter By' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
                <span className="md:hidden text-sm">
                  {statusFilter === 'all' ? 'Filter' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={12} className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter('all')} className="justify-between">
                All
                {statusFilter === 'all' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="justify-between">
                Completed
                {statusFilter === 'completed' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')} className="justify-between">
                Draft
                {statusFilter === 'draft' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('processing')} className="justify-between">
                Processing
                {statusFilter === 'processing' && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search Name"
              value={localQuery}
              onChange={handleSearchChange}
              icon={<Search className="w-4 h-4 md:w-3.5 md:h-3.5 text-gray-400" />}
              className="w-full bg-white rounded-full px-4 py-1.5 border border-gray-200 shadow-none focus-visible:ring-0 focus-visible:border-gray-300"
            />
          </div>
        </form>
      </div>

      {/* ── Grid or Empty ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 pb-28 md:pb-0 pt-1">
      {isLoading ? (
        <AssignmentGridSkeleton />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <Link 
        href="/assignments/create"
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 z-40 text-brand"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </Link>
      </div>
    </div>
  );
}
