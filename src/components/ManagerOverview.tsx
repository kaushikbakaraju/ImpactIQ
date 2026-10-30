import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Plus,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { User, QuarterlyGoal, Achievement, CoachingNote } from '../types';
import { dbStore } from '../services/db';

interface ManagerOverviewProps {
  currentUser: User;
  allUsers: User[];
  onSelectReportFor1on1: (report: User) => void;
  onRefresh: () => void;
}

export const ManagerOverview: React.FC<ManagerOverviewProps> = ({
  currentUser,
  allUsers,
  onSelectReportFor1on1,
  onRefresh,
}) => {
  // Direct reports of the logged-in manager
  const directReports = dbStore.getDirectReports(currentUser.id);
  const [selectedReportId, setSelectedReportId] = useState<string>(directReports[0]?.id || '');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteSentiment, setNewNoteSentiment] = useState<CoachingNote['sentiment']>('growth');
  const [newNoteTag, setNewNoteTag] = useState('Staff Promotion');

  const selectedReport = allUsers.find(u => u.id === selectedReportId);

  // Load data for the selected report through RLS
  const reportAchievements = selectedReportId
    ? dbStore.queryAchievements(currentUser.id, selectedReportId).data
    : [];

  const reportGoals = selectedReportId
    ? dbStore.queryGoals(currentUser.id, selectedReportId).data
    : [];

  const coachingNotes = selectedReportId
    ? dbStore.queryCoachingNotes(currentUser.id, selectedReportId).data
    : [];

  // Stalled objectives across ALL direct reports
  const allTeamGoals = directReports.flatMap(report =>
    dbStore.queryGoals(currentUser.id, report.id).data.map(g => ({ ...g, employeeName: report.name }))
  );
  const stalledObjectives = allTeamGoals.filter(g => g.health === 'stalled' || g.health === 'needs-attention');

  const handleAddCoachingNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedReportId) return;

    dbStore.saveCoachingNote({
      managerId: currentUser.id,
      employeeId: selectedReportId,
      note: newNoteText.trim(),
      tags: [newNoteTag],
      sentiment: newNoteSentiment,
    });

    setNewNoteText('');
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Engineering Leadership</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-indigo-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct-Report Hierarchy RLS Active
            </span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mt-1">
            {currentUser.name}’s Team Overview
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Managing {directReports.length} direct engineers in {currentUser.team}. Unapproved drafts are shielded by RLS; coaching notes are manager-only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 font-mono">
            {directReports.length} Direct Reports
          </span>
        </div>
      </div>

      {/* Stalled Objectives Alert Banner (Critical Requirement) */}
      {stalledObjectives.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                  Stalled Objectives Alert ({stalledObjectives.length} Team Roadblocks)
                </h3>
                <p className="text-xs text-rose-800">
                  These quarterly goals have had zero commit or status activity for &gt;7 days and require manager escalation.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {stalledObjectives.map((goal) => (
              <div
                key={goal.id}
                className="bg-white p-3.5 rounded-xl border border-rose-200/80 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-0.5">
                    <span className="font-bold text-stone-900">{goal.employeeName}</span>
                    <span>·</span>
                    <span className="text-rose-600 font-bold font-mono">
                      {goal.daysSinceLastActivity}d inactive
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 leading-snug">
                    {goal.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {goal.currentMetric}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const emp = allUsers.find(u => u.name === goal.employeeName);
                    if (emp) onSelectReportFor1on1(emp);
                  }}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded shrink-0 transition-colors"
                >
                  Add to 1:1
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Report Tree Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {directReports.map((report) => {
          const reportGoalsList = dbStore.queryGoals(currentUser.id, report.id).data;
          const reportAchievementsList = dbStore.queryAchievements(currentUser.id, report.id).data;
          const stalledCount = reportGoalsList.filter(g => g.health === 'stalled' || g.health === 'needs-attention').length;
          const isSelected = report.id === selectedReportId;

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-stone-900 shadow-md ring-1 ring-stone-900'
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={report.avatar}
                    alt={report.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{report.name}</h3>
                    <p className="text-[11px] text-stone-700 truncate max-w-[170px]">
                      {report.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReportFor1on1(report);
                  }}
                  title="Open 1:1 Copilot"
                  className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4 text-stone-700" />
                </button>
              </div>

              {/* Goal Health Metric rollup */}
              <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-stone-50 p-2 rounded-lg">
                  <div className="text-[10px] text-stone-700 uppercase font-semibold">Goals</div>
                  <div className="text-xs font-bold text-stone-900 mt-0.5">{reportGoalsList.length}</div>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg">
                  <div className="text-[10px] text-stone-700 uppercase font-semibold">Approved</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {reportAchievementsList.length}
                  </div>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg">
                  <div className="text-[10px] text-stone-700 uppercase font-semibold">Stalled</div>
                  <div className={`text-xs font-bold mt-0.5 ${stalledCount > 0 ? 'text-rose-600' : 'text-stone-500'}`}>
                    {stalledCount}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Report Detail View & Private Coaching Notes */}
      {selectedReport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Left Column: Approved Achievements & Goal Health */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {selectedReport.name}’s Approved Impact Log
                  </h3>
                  <p className="text-xs text-stone-500">
                    Verified achievements shared by employee. Unapproved drafts are strictly filtered out by RLS.
                  </p>
                </div>

                <button
                  onClick={() => onSelectReportFor1on1(selectedReport)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Start 1:1 Copilot</span>
                </button>
              </div>

              {reportAchievements.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <p className="text-xs text-stone-500">No approved achievements shared yet by {selectedReport.name}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportAchievements.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span className="font-mono">{item.sourceReference || item.source}</span>
                          <span>·</span>
                          <span>{new Date(item.approvedAt || item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          Verified Shared
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                      <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        {item.businessImpactStatement}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.quantifiedMetrics.map((metric, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OKR Pacing */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900">
                Quarterly OKR Status ({selectedReport.name})
              </h3>
              <div className="space-y-3">
                {reportGoals.map((goal) => (
                  <div key={goal.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-stone-900">{goal.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          goal.health === 'on-track'
                            ? 'bg-emerald-100 text-emerald-800'
                            : goal.health === 'stalled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {goal.health}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mb-2">{goal.currentMetric}</p>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-stone-900 h-full rounded-full"
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Private Coaching Notes (CONFIDENTIAL TO MANAGER) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Private Manager Coaching Notes</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900">
                  Confidential to {currentUser.name}
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Inaccessible to {selectedReport.name}. Enforced by PostgreSQL RLS policy <code className="text-stone-700">manager_coaching_notes_private</code>.
                </p>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddCoachingNote} className="space-y-3 pt-2 border-t border-stone-100">
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={`Write private observation, promotion calibration feedback, or coaching advice for ${selectedReport.name}...`}
                  className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 resize-none bg-stone-50/50"
                  required
                />

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newNoteSentiment}
                    onChange={(e) => setNewNoteSentiment(e.target.value as any)}
                    className="text-xs bg-stone-100 border border-stone-200 rounded-lg p-1.5 font-medium text-stone-800"
                  >
                    <option value="growth">Growth &amp; Mentorship</option>
                    <option value="positive">Positive / Win</option>
                    <option value="urgent">Urgent Escalation</option>
                    <option value="neutral">General Observation</option>
                  </select>

                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Saved Notes List */}
              <div className="space-y-3 pt-3 border-t border-stone-100 max-h-80 overflow-y-auto">
                {coachingNotes.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">
                    No coaching notes recorded yet for this engineer.
                  </p>
                ) : (
                  coachingNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="font-semibold text-stone-700">
                          {note.tags[0] || 'Coaching Note'}
                        </span>
                        <span className="font-mono">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-stone-800 leading-relaxed font-medium">
                        {note.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
