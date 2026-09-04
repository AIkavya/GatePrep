import React from 'react';
import { ChapterStatus, RevisionStatus, PyqDifficulty, PyqStatus, CalendarEventType } from '../../types';

export const StatusBadge: React.FC<{ status: ChapterStatus }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
          Completed
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#0071e3] border border-blue-200/80 dark:bg-blue-950/40 dark:text-[#2997ff] dark:border-blue-800/60">
          In Progress
        </span>
      );
    case 'not_started':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f5f5f7] text-[#86868b] border border-[#e5e5ea] dark:bg-[#2c2c2e] dark:text-[#a1a1a6] dark:border-[#38383a]">
          Not Started
        </span>
      );
  }
};

export const RevisionStatusBadge: React.FC<{ status: RevisionStatus }> = ({ status }) => {
  switch (status) {
    case 'due_today':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#ff3b30] border border-red-200/80 dark:bg-red-950/40 dark:text-[#ff453a] dark:border-red-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] dark:bg-[#ff453a] animate-pulse" />
          Due Today
        </span>
      );
    case 'overdue':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
          Overdue
        </span>
      );
    case 'upcoming':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Upcoming
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f5f5f7] text-[#86868b] border border-[#e5e5ea] dark:bg-[#2c2c2e] dark:text-[#a1a1a6] dark:border-[#38383a]">
          Completed
        </span>
      );
    case 'skipped':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
          Skipped
        </span>
      );
    default:
      return null;
  }
};

export const DifficultyBadge: React.FC<{ difficulty: PyqDifficulty }> = ({ difficulty }) => {
  switch (difficulty) {
    case 'easy':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
          Easy
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
          Medium
        </span>
      );
    case 'hard':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60">
          Hard
        </span>
      );
  }
};

export const PyqStatusBadge: React.FC<{ status: PyqStatus }> = ({ status }) => {
  switch (status) {
    case 'correct':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
          Correct
        </span>
      );
    case 'wrong':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60">
          Wrong
        </span>
      );
    case 'skipped':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
          Skipped
        </span>
      );
    case 'not_attempted':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f5f5f7] text-[#86868b] border border-[#e5e5ea] dark:bg-[#2c2c2e] dark:text-[#a1a1a6] dark:border-[#38383a]">
          Unattempted
        </span>
      );
  }
};

export const EventTypeBadge: React.FC<{ type: CalendarEventType }> = ({ type }) => {
  switch (type) {
    case 'revision':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-[#ff3b30] border border-red-200/80 dark:bg-red-950/40 dark:text-[#ff453a] dark:border-red-800/60">
          Revision
        </span>
      );
    case 'learning':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0071e3] border border-blue-200/80 dark:bg-blue-950/40 dark:text-[#2997ff] dark:border-blue-800/60">
          Learning
        </span>
      );
    case 'pyq':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-[#af52de] border border-purple-200/80 dark:bg-purple-950/40 dark:text-[#bf5af2] dark:border-purple-800/60">
          PYQ
        </span>
      );
    case 'other':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:border-[#38383a]">
          Other
        </span>
      );
  }
};

