import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmployeeWorkspace } from './components/EmployeeWorkspace';
import { ManagerOverview } from './components/ManagerOverview';
import { OneOnOneCopilot } from './components/OneOnOneCopilot';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { WebhookSimulatorModal } from './components/WebhookSimulatorModal';
import { RlsInspectorModal } from './components/RlsInspectorModal';
import { BragSheetModal } from './components/BragSheetModal';
import { WebhookHubView } from './components/WebhookHubView';
import { VisualGuideModal } from './components/VisualGuideModal';
import { DocumentationView } from './components/DocumentationView';
import { dbStore, INITIAL_USERS } from './services/db';
import { User, Achievement, QuarterlyGoal } from './types';
import {
  ShieldAlert,
  ShieldCheck,
  Target,
  Lock,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  // Default to Alex Rivera (Senior Staff IC)
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]);
  const [activeTab, setActiveTab] = useState<string>('workspace');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modals state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [rlsModalOpen, setRlsModalOpen] = useState(false);
  const [bragSheetOpen, setBragSheetOpen] = useState(false);
  const [visualGuideOpen, setVisualGuideOpen] = useState(false);
  const [selected1on1Partner, setSelected1on1Partner] = useState<User | undefined>(undefined);
  const [roleSwitchBanner, setRoleSwitchBanner] = useState<string | null>(null);

  // Hash-based routing sync for multi-page feel
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && ['workspace', 'team_overview', 'one_on_one', 'goals', 'coaching_notes', 'webhooks', 'docs'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  };

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Switch user (Persona & RLS Context switch)
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'EM') {
      handleTabChange('team_overview');
      setRoleSwitchBanner(`Switched to Manager context (${user.name}). Strict RLS now filters team data to your direct reporting tree.`);
    } else {
      handleTabChange('workspace');
      setRoleSwitchBanner(`Switched to Employee context (${user.name}). Your workspace is private; unapproved drafts are hidden from management.`);
    }
    setTimeout(() => setRoleSwitchBanner(null), 5000);
    forceRefresh();
  };

  // Load achievements and goals scoped by current user and RLS policies
  const userAchievements = dbStore.queryAchievements(currentUser.id, currentUser.id).data;
  const userGoals = dbStore.queryGoals(currentUser.id, currentUser.id).data;
  const pendingDraftsCount = userAchievements.filter(a => a.status === 'draft').length;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* Top Welcome / Orientation Bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-950 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>New to ImpactIQ?</strong> Take the interactive visual masterclass or explore the complete feature manual.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setVisualGuideOpen(true)}
              className="text-amber-900 hover:text-black font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <span>Visual Presentation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-amber-300">·</span>
            <button
              onClick={() => handleTabChange('docs')}
              className="text-amber-900 hover:text-black font-bold underline cursor-pointer"
            >
              Operations Manual
            </button>
          </div>
        </div>
      </div>

      {/* App Header */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenWebhookModal={() => setWebhookModalOpen(true)}
        onOpenRlsModal={() => setRlsModalOpen(true)}
        onOpenBragSheet={() => setBragSheetOpen(true)}
        onOpenVisualGuide={() => setVisualGuideOpen(true)}
        pendingDraftsCount={pendingDraftsCount}
      />

      {/* Role Switch & Security Notification Banner */}
      {roleSwitchBanner && (
        <div className="bg-stone-900 text-stone-200 px-4 py-2.5 text-xs flex items-center justify-between border-b border-stone-800 transition-all animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{roleSwitchBanner}</span>
            </div>
            <button
              onClick={() => setRoleSwitchBanner(null)}
              className="text-stone-400 hover:text-stone-200 text-xs font-mono"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'docs' ? (
          <DocumentationView
            currentUser={currentUser}
            onLaunchVoice={() => setVoiceModalOpen(true)}
            onLaunchWebhook={() => setWebhookModalOpen(true)}
            onLaunchRls={() => setRlsModalOpen(true)}
            onLaunchBragSheet={() => setBragSheetOpen(true)}
            onOpenVisualGuide={() => setVisualGuideOpen(true)}
          />
        ) : currentUser.role === 'IC' ? (
          // --- IC (Employee) Views ---
          <>
            {activeTab === 'workspace' && (
              <EmployeeWorkspace
                key={refreshKey}
                currentUser={currentUser}
                achievements={userAchievements}
                goals={userGoals}
                onRefresh={forceRefresh}
                onOpenVoiceModal={() => setVoiceModalOpen(true)}
                onOpenWebhookModal={() => setWebhookModalOpen(true)}
                onOpenBragSheet={() => setBragSheetOpen(true)}
              />
            )}

            {activeTab === 'one_on_one' && (
              <OneOnOneCopilot
                key={refreshKey}
                currentUser={currentUser}
                allUsers={allUsers}
                onRefresh={forceRefresh}
              />
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">
                      Quarterly Engineering Objectives (Q3 2026)
                    </h2>
                    <p className="text-xs text-stone-500">
                      High-impact OKRs automatically linked to approved achievements and Jira/GitHub PRs
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-700 font-mono">
                    {userGoals.length} Active OKRs
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userGoals.map((goal) => {
                    const linked = userAchievements.filter(a => a.linkedGoalId === goal.id && a.status === 'approved');
                    return (
                      <div
                        key={goal.id}
                        className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-mono text-stone-500">{goal.category}</span>
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

                        <div>
                          <h3 className="text-sm font-bold text-stone-900">{goal.title}</h3>
                          <p className="text-xs text-stone-600 mt-1">{goal.description}</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs font-mono mb-1">
                            <span className="text-stone-500">{goal.currentMetric}</span>
                            <span className="font-bold text-stone-900">{goal.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-stone-900 h-full rounded-full"
                              style={{ width: `${goal.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                          {linked.length} approved achievements mapped
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <WebhookHubView
                currentUser={currentUser}
                goals={userGoals}
                onOpenWebhookModal={() => setWebhookModalOpen(true)}
                onRefresh={forceRefresh}
              />
            )}
          </>
        ) : (
          // --- EM (Manager) Views ---
          <>
            {activeTab === 'team_overview' && (
              <ManagerOverview
                key={refreshKey}
                currentUser={currentUser}
                allUsers={allUsers}
                onSelectReportFor1on1={(report) => {
                  setSelected1on1Partner(report);
                  handleTabChange('one_on_one');
                }}
                onRefresh={forceRefresh}
              />
            )}

            {activeTab === 'one_on_one' && (
              <OneOnOneCopilot
                key={refreshKey}
                currentUser={currentUser}
                allUsers={allUsers}
                selectedPartner={selected1on1Partner}
                onRefresh={forceRefresh}
              />
            )}

            {activeTab === 'coaching_notes' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Manager Confidentiality Safeguard</span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">
                    Direct Report Coaching Notes (Confidential)
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    These notes are strictly private to you. Neither Alex, Elena, nor Marcus can view these records, enforced by PostgreSQL Row-Level Security policy <code className="text-stone-800 font-bold">manager_coaching_notes_private</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dbStore.getDirectReports(currentUser.id).map((report) => {
                    const notes = dbStore.queryCoachingNotes(currentUser.id, report.id).data;
                    return (
                      <div key={report.id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={report.avatar}
                            alt={report.name}
                            className="w-9 h-9 rounded-full object-cover border border-stone-200"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-stone-900">{report.name}</h3>
                            <p className="text-[11px] text-stone-500">{report.title.slice(0, 24)}...</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-stone-100">
                          {notes.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">No notes recorded.</p>
                          ) : (
                            notes.map((n) => (
                              <div key={n.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-stone-400">
                                  <span className="font-bold text-stone-700">{n.tags[0]}</span>
                                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-stone-800 font-medium">{n.note}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <WebhookHubView
                currentUser={currentUser}
                goals={userGoals}
                onOpenWebhookModal={() => setWebhookModalOpen(true)}
                onRefresh={forceRefresh}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">ImpactIQ</span>
            <span>·</span>
            <span>PostgreSQL RLS &amp; AI-Driven Engineering Performance</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <button
              onClick={() => setVisualGuideOpen(true)}
              className="hover:text-stone-900 flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Visual Guide</span>
            </button>
            <span>·</span>
            <button
              onClick={() => handleTabChange('docs')}
              className="hover:text-stone-900 flex items-center gap-1 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentation</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setRlsModalOpen(true)}
              className="hover:text-stone-900 flex items-center gap-1 font-mono text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>RLS Policies Active</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoiceRecorderModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        userId={currentUser.id}
        userGoals={userGoals}
        onAchievementCreated={forceRefresh}
      />

      <WebhookSimulatorModal
        isOpen={webhookModalOpen}
        onClose={() => setWebhookModalOpen(false)}
        userId={currentUser.id}
        userGoals={userGoals}
        onAchievementCreated={forceRefresh}
      />

      <RlsInspectorModal
        isOpen={rlsModalOpen}
        onClose={() => setRlsModalOpen(false)}
        allUsers={allUsers}
        currentUserId={currentUser.id}
      />

      <BragSheetModal
        isOpen={bragSheetOpen}
        onClose={() => setBragSheetOpen(false)}
        employee={currentUser.role === 'IC' ? currentUser : allUsers.find(u => u.id === selected1on1Partner?.id) || allUsers[1]}
        achievements={dbStore.queryAchievements(currentUser.id, currentUser.role === 'IC' ? currentUser.id : selected1on1Partner?.id || 'user_ic_1').data}
        goals={dbStore.queryGoals(currentUser.id, currentUser.role === 'IC' ? currentUser.id : selected1on1Partner?.id || 'user_ic_1').data}
      />

      <VisualGuideModal
        isOpen={visualGuideOpen}
        onClose={() => setVisualGuideOpen(false)}
        onLaunchVoice={() => setVoiceModalOpen(true)}
        onLaunchWebhook={() => setWebhookModalOpen(true)}
        onLaunchRls={() => setRlsModalOpen(true)}
        onLaunchBragSheet={() => setBragSheetOpen(true)}
      />
    </div>
  );
}
