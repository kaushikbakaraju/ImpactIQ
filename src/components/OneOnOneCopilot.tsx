import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  AlertCircle,
  CheckSquare,
  Square,
  Clock,
  Send,
  Users,
  Award,
  ChevronRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { User, OneOnOneAgenda, AgendaItem, ActionItem, QuarterlyGoal, Achievement } from '../types';
import { synthesize1on1Agenda } from '../services/gemini';
import { dbStore } from '../services/db';

interface OneOnOneCopilotProps {
  currentUser: User;
  allUsers: User[];
  selectedPartner?: User;
  onRefresh: () => void;
}

export const OneOnOneCopilot: React.FC<OneOnOneCopilotProps> = ({
  currentUser,
  allUsers,
  selectedPartner: initialPartner,
  onRefresh,
}) => {
  const isIC = currentUser.role === 'IC';

  // Determine the meeting pair:
  // If IC: partner is their direct manager (Sarah Lin)
  // If EM: partner is the selected direct report (Alex Rivera, Elena, or Marcus)
  const defaultPartner = isIC
    ? allUsers.find(u => u.id === currentUser.managerId) || allUsers[0]
    : initialPartner || dbStore.getDirectReports(currentUser.id)[0] || allUsers[1];

  const [partnerId, setPartnerId] = useState<string>(defaultPartner?.id || '');
  const partner = allUsers.find(u => u.id === partnerId) || defaultPartner;

  const employee = isIC ? currentUser : partner;
  const manager = isIC ? partner : currentUser;

  // Retrieve agenda for this employee + manager pair
  const existingAgendas = employee && manager ? dbStore.queryAgendas(employee.id, manager.id) : [];
  const [currentAgenda, setCurrentAgenda] = useState<OneOnOneAgenda>(
    existingAgendas[0] || {
      id: 'agenda_' + Date.now(),
      employeeId: employee.id,
      managerId: manager.id,
      scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'scheduled',
      executiveSummary: 'Upcoming bi-weekly 1:1 sync. AI Copilot is ready to synthesize recent approved achievements and stalled goals into an agenda.',
      talkingPoints: [],
      blockers: [],
      actionItems: [],
      sharedNotes: '',
      createdAt: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (initialPartner?.id) {
      setPartnerId(initialPartner.id);
    }
  }, [initialPartner?.id]);

  useEffect(() => {
    if (employee && manager) {
      const agendas = dbStore.queryAgendas(employee.id, manager.id);
      if (agendas.length > 0) {
        setCurrentAgenda(agendas[0]);
      } else {
        setCurrentAgenda({
          id: 'agenda_' + Date.now(),
          employeeId: employee.id,
          managerId: manager.id,
          scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          status: 'scheduled',
          executiveSummary: 'Upcoming bi-weekly 1:1 sync. AI Copilot is ready to synthesize recent approved achievements and stalled goals into an agenda.',
          talkingPoints: [],
          blockers: [],
          actionItems: [],
          sharedNotes: '',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [employee?.id, manager?.id]);

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState<'employee' | 'manager'>('employee');

  // Load employee's data (through RLS)
  const approvedAchievements = dbStore.queryAchievements(currentUser.id, employee.id).data;
  const goals = dbStore.queryGoals(currentUser.id, employee.id).data;
  const coachingNotes = dbStore.queryCoachingNotes(currentUser.id, employee.id).data;

  const handleSynthesizeAgenda = async () => {
    setIsSynthesizing(true);
    try {
      const synthesized = await synthesize1on1Agenda(
        employee,
        manager,
        approvedAchievements,
        goals,
        coachingNotes
      );

      const updatedAgenda: OneOnOneAgenda = {
        ...currentAgenda,
        executiveSummary: synthesized.executiveSummary,
        talkingPoints: synthesized.talkingPoints.map((tp, index) => ({
          id: 'tp_' + Date.now() + '_' + index,
          title: tp.title,
          description: tp.description,
          type: tp.type,
          aiSuggested: true,
          completed: false,
          suggestedBy: 'ImpactIQ Copilot',
        })),
        blockers: synthesized.blockers,
        actionItems: synthesized.actionItems.map((ai, index) => ({
          id: 'act_' + Date.now() + '_' + index,
          task: ai.task,
          assigneeId: ai.assigneeRole === 'employee' ? employee.id : manager.id,
          dueDate: ai.suggestedDueDate,
          completed: false,
        })),
        lastSynthesizedAt: new Date().toISOString(),
      };

      setCurrentAgenda(updatedAgenda);
      dbStore.saveAgenda(updatedAgenda);
      onRefresh();
    } catch (err) {
      console.error('Error synthesizing agenda:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const toggleTalkingPoint = (id: string) => {
    const updated = {
      ...currentAgenda,
      talkingPoints: currentAgenda.talkingPoints.map(tp =>
        tp.id === id ? { ...tp, completed: !tp.completed } : tp
      ),
    };
    setCurrentAgenda(updated);
    dbStore.saveAgenda(updated);
  };

  const toggleActionItem = (id: string) => {
    const updated = {
      ...currentAgenda,
      actionItems: currentAgenda.actionItems.map(ai =>
        ai.id === id ? { ...ai, completed: !ai.completed } : ai
      ),
    };
    setCurrentAgenda(updated);
    dbStore.saveAgenda(updated);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTp: AgendaItem = {
      id: 'tp_custom_' + Date.now(),
      title: newTopicTitle.trim(),
      type: 'strategy',
      aiSuggested: false,
      completed: false,
      suggestedBy: currentUser.name,
    };

    const updated = {
      ...currentAgenda,
      talkingPoints: [...currentAgenda.talkingPoints, newTp],
    };
    setCurrentAgenda(updated);
    dbStore.saveAgenda(updated);
    setNewTopicTitle('');
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTask.trim()) return;

    const newAi: ActionItem = {
      id: 'act_custom_' + Date.now(),
      task: newActionTask.trim(),
      assigneeId: newActionAssignee === 'employee' ? employee.id : manager.id,
      dueDate: new Date(Date.now() + 86400000 * 5).toLocaleDateString(),
      completed: false,
    };

    const updated = {
      ...currentAgenda,
      actionItems: [...currentAgenda.actionItems, newAi],
    };
    setCurrentAgenda(updated);
    dbStore.saveAgenda(updated);
    setNewActionTask('');
  };

  const handleUpdateNotes = (notes: string) => {
    const updated = {
      ...currentAgenda,
      sharedNotes: notes,
    };
    setCurrentAgenda(updated);
    dbStore.saveAgenda(updated);
  };

  return (
    <div className="space-y-8">
      {/* 1:1 Copilot Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Automated 1:1 Copilot Module</span>
            <span>·</span>
            <span className="text-emerald-600 font-bold">Collaborative Workspace</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900">
            1:1 Sync: {employee.name} &amp; {manager.name}
          </h1>
          <p className="text-xs text-stone-600">
            Synthesizes approved engineering wins, stalled objectives, and AI-recommended talking points into an aligned meeting agenda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* If EM, report switcher */}
          {!isIC && (
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900"
            >
              {dbStore.getDirectReports(currentUser.id).map((r) => (
                <option key={r.id} value={r.id}>
                  Sync with: {r.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSynthesizeAgenda}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {isSynthesizing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Agenda...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Run 1:1 AI Copilot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Agenda Executive Summary Card */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-stone-300">
              AI Copilot Executive Synthesis
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {currentAgenda.lastSynthesizedAt
              ? `Synthesized ${new Date(currentAgenda.lastSynthesizedAt).toLocaleTimeString()}`
              : 'Auto-Scheduled Cadence: Bi-Weekly'}
          </span>
        </div>

        <p className="text-xs text-stone-200 leading-relaxed font-sans">
          {currentAgenda.executiveSummary}
        </p>

        {/* Quick stat bar */}
        <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center gap-6 text-xs text-stone-300">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{approvedAchievements.length} Approved Wins Ingested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{goals.filter(g => g.health === 'stalled').length} Stalled Objectives Identified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mutual Visibility &amp; Co-Ownership</span>
          </div>
        </div>
      </div>

      {/* Main Agenda Grid: Left (Talking Points & Blockers) | Right (Action Items & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Blockers Alert Box */}
          {currentAgenda.blockers.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Detected Blockers Requiring Immediate 1:1 Discussion</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 pl-6 list-disc">
                {currentAgenda.blockers.map((blocker, i) => (
                  <li key={i}>{blocker}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Talking Points Section */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Collaborative Talking Points
                </h3>
                <p className="text-xs text-stone-500">
                  Check off items as discussed during your 1:1 sync
                </p>
              </div>

              <span className="text-xs text-stone-500 font-mono">
                {currentAgenda.talkingPoints.filter(t => t.completed).length} / {currentAgenda.talkingPoints.length} covered
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {currentAgenda.talkingPoints.length === 0 ? (
                <div className="p-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
                  Click "Run 1:1 AI Copilot" above to synthesize talking points from recent performance and goals.
                </div>
              ) : (
                currentAgenda.talkingPoints.map((tp) => (
                  <div
                    key={tp.id}
                    onClick={() => toggleTalkingPoint(tp.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      tp.completed
                        ? 'bg-stone-50/60 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-stone-400 hover:text-stone-700"
                    >
                      {tp.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                            tp.type === 'celebration'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tp.type === 'blocker'
                              ? 'bg-rose-100 text-rose-800'
                              : tp.type === 'growth'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tp.type}
                        </span>

                        {tp.aiSuggested && (
                          <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            AI Suggested
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-xs font-bold ${
                          tp.completed ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {tp.title}
                      </h4>

                      {tp.description && (
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {tp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Talking Point */}
            <form onSubmit={handleAddTopic} className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Add custom talking point..."
                className="flex-1 text-xs p-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Mutual Action Items & Collaborative Notes */}
        <div className="space-y-6">
          {/* Action Items */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">
                1:1 Action Items
              </h3>
              <span className="text-xs text-stone-500 font-mono">
                {currentAgenda.actionItems.filter(a => a.completed).length} / {currentAgenda.actionItems.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {currentAgenda.actionItems.map((act) => {
                const assignee = allUsers.find(u => u.id === act.assigneeId);
                return (
                  <div
                    key={act.id}
                    onClick={() => toggleActionItem(act.id)}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                      act.completed
                        ? 'bg-stone-50 border-stone-200 text-stone-400'
                        : 'bg-white border-stone-200 text-stone-900 hover:border-stone-300'
                    }`}
                  >
                    <button type="button" className="mt-0.5 text-stone-400">
                      {act.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${act.completed ? 'line-through' : ''}`}>
                        {act.task}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                        <span>Assignee: <strong>{assignee?.name || 'Owner'}</strong></span>
                        <span>·</span>
                        <span>Due: {act.dueDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add action item form */}
            <form onSubmit={handleAddActionItem} className="pt-2 border-t border-stone-100 space-y-2">
              <input
                type="text"
                value={newActionTask}
                onChange={(e) => setNewActionTask(e.target.value)}
                placeholder="New follow-up action item..."
                className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
              />
              <div className="flex items-center justify-between">
                <select
                  value={newActionAssignee}
                  onChange={(e) => setNewActionAssignee(e.target.value as any)}
                  className="text-xs bg-stone-50 border border-stone-200 rounded-lg p-1.5 font-medium"
                >
                  <option value="employee">{employee.name} (IC)</option>
                  <option value="manager">{manager.name} (EM)</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add Action
                </button>
              </div>
            </form>
          </div>

          {/* Collaborative Notes Scratchpad */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">
                Shared 1:1 Notes Scratchpad
              </h3>
              <span className="text-[11px] text-emerald-700 font-medium">
                Live Synced
              </span>
            </div>
            <textarea
              rows={8}
              value={currentAgenda.sharedNotes}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              placeholder="Capture joint meeting decisions, notes, and promotion alignment topics during your 1:1 sync..."
              className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 bg-stone-50/50 resize-none font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
