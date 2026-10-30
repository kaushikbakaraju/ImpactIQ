import React from 'react';
import {
  Mic,
  GitPullRequest,
  ShieldCheck,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { User, Role } from '../types';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVoiceModal: () => void;
  onOpenWebhookModal: () => void;
  onOpenRlsModal: () => void;
  onOpenBragSheet: () => void;
  pendingDraftsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  activeTab,
  setActiveTab,
  onOpenVoiceModal,
  onOpenWebhookModal,
  onOpenRlsModal,
  onOpenBragSheet,
  pendingDraftsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isIC = currentUser.role === 'IC';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold tracking-tight text-base shadow-sm">
                IQ
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-stone-900 block leading-none">
                  ImpactIQ
                </span>
                <span className="text-[11px] text-stone-700 tracking-wide block mt-0.5">
                  Performance & 1:1 Copilot
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {isIC ? (
                <>
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'workspace'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    Private Workspace
                    {pendingDraftsCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                        {pendingDraftsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('one_on_one')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      activeTab === 'one_on_one'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    1:1 Copilot
                  </button>
                  <button
                    onClick={() => setActiveTab('goals')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'goals'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    Quarterly OKRs
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('team_overview')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      activeTab === 'team_overview'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Team Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('one_on_one')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      activeTab === 'one_on_one'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    1:1 Copilot
                  </button>
                  <button
                    onClick={() => setActiveTab('coaching_notes')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'coaching_notes'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    Private Coaching
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('webhooks')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'webhooks'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                Webhook Hub
              </button>
            </nav>
          </div>

          {/* Action Tools & Persona Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Voice Capture Quick Trigger */}
            <button
              onClick={onOpenVoiceModal}
              title="Record voice update (Whisper / Deepgram / Gemini)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Voice Update</span>
            </button>

            {/* Quick Webhook trigger */}
            <button
              onClick={onOpenWebhookModal}
              title="Simulate GitHub PR or Jira Ticket webhook"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Webhook</span>
            </button>

            {/* Brag Sheet Quick trigger (for IC or EM viewing report) */}
            <button
              onClick={onOpenBragSheet}
              title="Export Quarterly Brag Sheet"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Brag Sheet</span>
            </button>

            {/* RLS Policy Inspector */}
            <button
              onClick={onOpenRlsModal}
              title="Inspect PostgreSQL Row-Level Security Policies"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline text-[11px] font-mono">RLS Active</span>
            </button>

            {/* User / Persona Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 transition-all text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-stone-300"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-stone-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-stone-700 font-medium">
                    {currentUser.role === 'IC' ? 'Individual Contributor' : 'Engineering Manager'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                      Switch Role & Hierarchy Context
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      RLS security rules dynamically scope data based on selected persona.
                    </p>
                  </div>

                  <div className="py-1">
                    {allUsers.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-stone-50 transition-colors ${
                            isSelected ? 'bg-stone-50/80 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-stone-200"
                            />
                            <div>
                              <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                                {user.name}
                                <span className="text-[10px] font-mono text-stone-700">
                                  [{user.role}]
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-700 truncate max-w-[150px]">
                                {user.title}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
