import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  Clock,
  BookOpen,
  RotateCcw,
  FileQuestion,
  Filter,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { CalendarEvent, CalendarEventType } from '../../types';
import { getTodayDateString, addDays, parseDate } from '../../utils/dateUtils';
import { EventTypeBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const CalendarPage: React.FC = () => {
  const {
    subjects,
    chapters,
    calendarEvents,
    selectedSubjectId,
    setSelectedSubjectId,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    completeRevision,
  } = useGate();

  // Current viewing month & year
  const todayStr = getTodayDateString();
  const todayObj = parseDate(todayStr);
  const [currentDate, setCurrentDate] = useState<Date>(todayObj);

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Add/Edit Event Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSubjectId, setFormSubjectId] = useState<string>(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
  );
  const [formChapterId, setFormChapterId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('learning');
  const [formDate, setFormDate] = useState(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filter events by subject if selected
  const filteredEvents = calendarEvents.filter((ev) =>
    selectedSubjectId === 'all' ? true : ev.subjectId === selectedSubjectId
  );

  // Calendar Grid Calculation
  // First day of current month (0: Sunday, 1: Monday, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0: (day + 6) % 7
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  const handleOpenAddForDate = (dateStr: string) => {
    setFormDate(dateStr);
    setFormSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '');
    setFormChapterId('');
    setFormTitle('');
    setFormType('learning');
    setIsAddModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubjectId || !formDate) return;

    addCalendarEvent({
      subjectId: formSubjectId,
      chapterId: formChapterId || undefined,
      title: formTitle.trim(),
      type: formType,
      date: formDate,
      status: 'pending',
    });

    setIsAddModalOpen(false);
  };

  const availableChapters = chapters.filter((c) => c.subjectId === formSubjectId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">Subject-Wise Calendar</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
              Integrated Schedule
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Track learning deadlines, automated spaced revisions, and scheduled PYQ drills by subject.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-add-calendar-event"
            onClick={() => handleOpenAddForDate(todayStr)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedSubjectId === 'all'
              ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-black dark:border-[#f5f5f7]'
              : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          All Calendars
        </button>
        {subjects.map((s) => {
          const count = calendarEvents.filter((e) => e.subjectId === s.id).length;
          const isSelected = selectedSubjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-[#0071e3] text-white border-[#0071e3] dark:bg-[#2997ff] dark:text-black dark:border-[#2997ff]'
                  : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              {s.code || s.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Calendar Month Card */}
      <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs overflow-hidden transition-colors">
        {/* Month Header & Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5ea] dark:border-[#333336] bg-[#f5f5f7]/60 dark:bg-[#1d1d1f]/60">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{monthName}</h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#3a3a3c] hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] shadow-2xs transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-6 py-2.5 bg-[#f5f5f7] dark:bg-[#1d1d1f] text-[11px] font-medium text-[#86868b] dark:text-[#a1a1a6] border-b border-[#e5e5ea] dark:border-[#333336] flex-wrap">
          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Event Types:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] dark:bg-[#2997ff]" /> Learning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] dark:text-[#ff453a]" /> Revision (Auto)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#af52de]" /> PYQ Drill
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#86868b]" /> Other
          </span>
        </div>

        {/* Calendar Grid with responsive horizontal scroll for small screens */}
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[560px] sm:min-w-0">
            {/* Day of Week Labels (Mon to Sun) */}
            <div className="grid grid-cols-7 border-b border-[#e5e5ea] dark:border-[#333336] text-center text-xs font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider py-2.5 bg-white dark:bg-[#161617]">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#e5e5ea] dark:divide-[#333336] bg-[#e5e5ea] dark:bg-[#333336]">
              {daysArray.map((dayNum, index) => {
                if (dayNum === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[100px] sm:min-h-[120px] bg-[#f5f5f7]/60 dark:bg-[#1d1d1f]/60 p-2"
                    />
                  );
                }

                const monthStr = String(month + 1).padStart(2, '0');
                const dayStr = String(dayNum).padStart(2, '0');
                const currentCellDate = `${year}-${monthStr}-${dayStr}`;
                const isToday = currentCellDate === todayStr;

                const cellEvents = filteredEvents.filter((ev) => ev.date === currentCellDate);

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => handleOpenAddForDate(currentCellDate)}
                    className={`min-h-[100px] sm:min-h-[120px] bg-white dark:bg-[#161617] p-1.5 sm:p-2 relative flex flex-col justify-between group hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors cursor-pointer ${
                      isToday ? 'bg-blue-50/30 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            isToday
                              ? 'bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black'
                              : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff]'
                          }`}
                        >
                          {dayNum}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAddForDate(currentCellDate);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] text-[#86868b]"
                          title="Add event on this day"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Events list */}
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {cellEvents.map((ev) => {
                          const isCompleted = ev.status === 'completed';
                          let colorClasses = 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-[#e5e5ea] dark:border-[#3a3a3c]';
                          if (ev.type === 'revision') colorClasses = 'bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] border-red-200/70 dark:border-red-800/60';
                          if (ev.type === 'learning') colorClasses = 'bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border-blue-200/70 dark:border-blue-800/60';
                          if (ev.type === 'pyq') colorClasses = 'bg-purple-50 dark:bg-purple-950/40 text-[#af52de] border-purple-200/70 dark:border-purple-800/60';

                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium border truncate cursor-pointer hover:shadow-xs transition-shadow flex items-center gap-1 ${colorClasses} ${
                                isCompleted ? 'line-through opacity-60' : ''
                              }`}
                            >
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Event Details Modal */}
      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        subtitle={selectedEvent?.date}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EventTypeBadge type={selectedEvent.type} />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#3a3a3c]">
                  {selectedEvent.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{selectedEvent.title}</h3>
            </div>

            <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] p-3.5 rounded-xl border border-[#e5e5ea] dark:border-[#333336] text-xs space-y-1.5">
              <div>
                <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Subject: </span>
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
                  {subjects.find((s) => s.id === selectedEvent.subjectId)?.name || 'Subject'}
                </span>
              </div>
              {selectedEvent.chapterId && (
                <div>
                  <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Chapter: </span>
                  <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
                    {chapters.find((c) => c.id === selectedEvent.chapterId)?.name || 'Topic'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Date: </span>
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{selectedEvent.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
              <button
                onClick={() => {
                  deleteCalendarEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="px-3.5 py-1.5 text-xs text-[#ff3b30] dark:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Event</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedEvent.revisionId && selectedEvent.status !== 'completed' && (
                  <button
                    onClick={() => {
                      completeRevision(selectedEvent.revisionId!);
                      setSelectedEvent(null);
                    }}
                    className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Revision</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-full font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Custom Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Calendar Event"
        subtitle="Schedule a study session, test, or milestone"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Subject</label>
            <select
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code || sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Chapter (Optional)
            </label>
            <select
              value={formChapterId}
              onChange={(e) => setFormChapterId(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            >
              <option value="">None / General</option>
              {availableChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Event Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as CalendarEventType)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="learning">Learning Session</option>
                <option value="revision">Revision Task</option>
                <option value="pyq">PYQ Drill</option>
                <option value="other">Other / Mock Test</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Event Title</label>
            <input
              type="text"
              placeholder="e.g. DBMS: Transactions PYQ Practice (20 Qs)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs transition-colors"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
