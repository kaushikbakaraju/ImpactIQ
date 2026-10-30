import React, { useState } from 'react';
import {
  Lock,
  Share2,
  CheckCircle2,
  Edit3,
  Trash2,
  Mic,
  GitPullRequest,
  Ticket,
  Sparkles,
  Award,
  ChevronRight,
  Target,
  Clock,
  AlertCircle,
  FileText,
  Save,
  X,
  Plus,
} from 'lucide-react';
import { Achievement, QuarterlyGoal, User } from '../types';
import { dbStore } from '../services/db';

interface EmployeeWorkspaceProps {
  currentUser: User;
  achievements: Achievement[];
  goals: QuarterlyGoal[];
  onRefresh: () => void;
  onOpenVoiceModal: () => void;
  onOpenWebhookModal: () => void;
  onOpenBragSheet: () => void;
}

export const EmployeeWorkspace: React.FC<EmployeeWorkspaceProps> = ({
  currentUser,
  achievements,
  goals,
  onRefresh,
  onOpenVoiceModal,
  onOpenWebhookModal,
  onOpenBragSheet,
}) => {
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');

  const drafts = achievements.filter(a => a.status === 'draft');
  const approved = achievements.filter(a => a.status === 'approved');

  const handleApprove = (achievementId: string) => {
    try {
      dbStore.approveAchievement(achievementId, currentUser.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = (achievementId: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      dbStore.deleteAchievement(achievementId, currentUser.id);
      onRefresh();
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAchievement) return;
    dbStore.updateAchievement(editingAchievement.id, editingAchievement, currentUser.id);
    setEditingAchievement(null);
    onRefresh();
  };

  const allTags = Array.from(new Set(approved.flatMap(a => a.tags)));
  const filteredApproved = filterTag === 'all' ? approved : approved.filter(a => a.tags.includes(filterTag));

  return (
    <div className="space-y-8">
      {/* Workspace Header / Welcome Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Private Engineering Workspace</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <Lock className="w-3 h-3" />
              RLS Private Draft Isolation
            </span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mt-1">
            {currentUser.name}’s Impact Hub
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Draft updates are strictly private to you. Review and approve achievements to share them with Engineering Manager {currentUser.managerId ? 'Sarah Lin' : 'Management'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>Voice Memo</span>
          </button>
          <button
            onClick={onOpenWebhookModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer"
          >
            <GitPullRequest className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulate PR / Jira</span>
          </button>
          <button
            onClick={onOpenBragSheet}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Brag Sheet</span>
          </button>
        </div>
      </div>

      {/* Grid: Main Column (Drafts + Approved) & Sidebar (Quarterly Goals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: Pending Review & Private Drafts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-stone-900">
                  Needs Review &amp; Approval
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  {drafts.length} Pending
                </span>
              </div>
              <span className="text-xs text-stone-700 flex items-center gap-1">
                <Lock className="w-3 h-3 text-stone-400" />
                Hidden from EM until approved
              </span>
            </div>

            {drafts.length === 0 ? (
              <div className="p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center">
                <Sparkles className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-stone-800">All achievements approved and shared!</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  Record an ad-hoc voice memo or simulate a GitHub PR to capture your latest production wins.
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={onOpenVoiceModal}
                    className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50"
                  >
                    Record Voice Update
                  </button>
                  <button
                    onClick={onOpenWebhookModal}
                    className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50"
                  >
                    Simulate GitHub PR
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => {
                  const linkedGoal = goals.find(g => g.id === draft.linkedGoalId);
                  return (
                    <div
                      key={draft.id}
                      className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all space-y-3.5 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {draft.source === 'voice' && <Mic className="w-3 h-3 text-rose-500" />}
                            {draft.source === 'github_pr' && <GitPullRequest className="w-3 h-3 text-blue-500" />}
                            {draft.source === 'jira_ticket' && <Ticket className="w-3 h-3 text-indigo-500" />}
                            {draft.sourceReference || draft.source}
                          </span>
                          <span className="text-[11px] text-stone-400">·</span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            {new Date(draft.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Status chip */}
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium border border-amber-200">
                          <Lock className="w-3 h-3" />
                          <span>Private Draft</span>
                        </div>
                      </div>

                      {/* Title & XYZ Business Statement */}
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">
                          {draft.title}
                        </h3>
                        <p className="text-xs text-stone-700 mt-1.5 leading-relaxed bg-stone-50/80 p-3 rounded-lg border border-stone-200 font-medium">
                          {draft.businessImpactStatement}
                        </p>
                      </div>

                      {/* Quantified Metrics Rollup */}
                      {draft.quantifiedMetrics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {draft.quantifiedMetrics.map((metric, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Linked Goal info */}
                      {linkedGoal && (
                        <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                          <Target className="w-3.5 h-3.5 text-stone-400" />
                          <span className="truncate">Auto-linked: <strong>{linkedGoal.title}</strong></span>
                          {draft.goalMatchConfidence && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono ml-auto shrink-0">
                              {draft.goalMatchConfidence}% match
                            </span>
                          )}
                        </div>
                      )}

                      {/* Filtered Trivia Note */}
                      {draft.triviaFilteredOut?.length > 0 && (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <span className="font-semibold text-stone-600">AI Trivia Filter:</span>
                          <span className="truncate italic">{draft.triviaFilteredOut.join(', ')}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingAchievement(draft)}
                            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium px-2 py-1 rounded hover:bg-stone-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Statement</span>
                          </button>
                          <button
                            onClick={() => handleDelete(draft.id)}
                            className="flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Discard</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleApprove(draft.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approve &amp; Share to EM</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: Approved & Shared Achievements Timeline */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Approved &amp; Shared Achievements
                </h2>
                <p className="text-xs text-stone-500">
                  Visible to Engineering Manager Sarah Lin and included in your Quarterly Brag Sheet
                </p>
              </div>

              {allTags.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilterTag('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      filterTag === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All ({approved.length})
                  </button>
                  {allTags.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        filterTag === tag
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {filteredApproved.map((item) => {
                const linkedGoal = goals.find(g => g.id === item.linkedGoalId);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                          <span className="font-mono">{item.sourceReference || item.source}</span>
                          <span>·</span>
                          <span>Approved {new Date(item.approvedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Shared</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {item.businessImpactStatement}
                    </p>

                    <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-mono">
                      Craft: {item.technicalCraftSummary}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.quantifiedMetrics.map((metric, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>

                      {linkedGoal && (
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Target className="w-3 h-3 text-stone-400" />
                          {linkedGoal.title.slice(0, 32)}...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Quarterly Goals (OKRs) & Pacing */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-stone-700" />
                <span>Quarterly Goals (Q3 2026)</span>
              </h3>
              <span className="text-xs text-stone-700 font-medium">3 Active</span>
            </div>

            <div className="space-y-4">
              {goals.map((goal) => {
                const linkedCount = achievements.filter(a => a.linkedGoalId === goal.id && a.status === 'approved').length;
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 leading-snug">
                        {goal.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
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

                    <p className="text-[11px] text-stone-700 line-clamp-2">
                      {goal.description}
                    </p>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-stone-700">{goal.currentMetric}</span>
                        <span className="font-bold text-stone-900">{goal.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            goal.health === 'stalled' ? 'bg-rose-500' : 'bg-stone-900'
                          }`}
                          style={{ width: `${goal.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-700 pt-1">
                      <span>{linkedCount} approved wins linked</span>
                      {goal.health === 'stalled' && (
                        <span className="text-rose-600 font-bold flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          {goal.daysSinceLastActivity}d inactive
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Brag Sheet CTA Box */}
          <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold">Quarterly "Brag Sheet" Export</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Compile your approved achievements, quantified metrics, and OKR impact into a one-click executive report ready for performance review calibration.
            </p>
            <button
              onClick={onOpenBragSheet}
              className="w-full py-2 bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Generate Q3 Brag Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Edit Achievement Modal */}
      {editingAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">
                Edit Business Impact Statement
              </h3>
              <button
                type="button"
                onClick={() => setEditingAchievement(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingAchievement.title}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Business Impact Statement (Google XYZ Formula)
                </label>
                <textarea
                  rows={3}
                  value={editingAchievement.businessImpactStatement}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, businessImpactStatement: e.target.value })}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Technical Craft Summary
                </label>
                <textarea
                  rows={2}
                  value={editingAchievement.technicalCraftSummary}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, technicalCraftSummary: e.target.value })}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Link to Quarterly OKR
                </label>
                <select
                  value={editingAchievement.linkedGoalId || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, linkedGoalId: e.target.value })}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg bg-white"
                >
                  <option value="">-- No Goal Link --</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.quarter})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAchievement(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
