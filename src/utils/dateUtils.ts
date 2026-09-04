import { RevisionStatus } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  const tomorrowStr = addDays(todayStr, 1);
  const yesterdayStr = addDays(todayStr, -1);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDateHeader(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDayDifference(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1).getTime();
  const d2 = parseDate(dateStr2).getTime();
  const diffMs = d1 - d2;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getRevisionStatus(
  dueDate: string,
  isCompleted: boolean,
  isSkipped: boolean = false,
  todayStr: string = getTodayDateString()
): RevisionStatus {
  if (isCompleted) return 'completed';
  if (isSkipped) return 'skipped';
  if (dueDate === todayStr) return 'due_today';
  if (dueDate < todayStr) return 'overdue';
  return 'upcoming';
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

