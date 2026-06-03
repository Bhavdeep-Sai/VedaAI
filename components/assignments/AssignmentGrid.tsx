'use client';

import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { AssignmentCard } from './AssignmentCard';
import { EmptyState } from './EmptyState';
import { AssignmentGridSkeleton } from '@/components/ui/skeleton';
import { useAssignmentStore } from '@/stores/assignment.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AssignmentGrid() {
  const { assignments, isLoading, fetchAssignments, searchQuery, setSearchQuery } =
    useAssignmentStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);

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



  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Filter/Search Bar ─────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 flex-shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter By
        </Button>
        <Input
          type="search"
          placeholder="Search Assignment"
          value={localQuery}
          onChange={handleSearchChange}
          icon={<Search className="w-3.5 h-3.5" />}
          className="max-w-xs"
        />
      </form>

      {/* ── Grid or Empty ─────────────────────────────────────── */}
      {isLoading ? (
        <AssignmentGridSkeleton />
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}
