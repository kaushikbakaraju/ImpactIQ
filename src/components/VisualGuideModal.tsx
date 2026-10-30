import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  ShieldCheck,
  Mic,
  GitPullRequest,
  Award,
  Calendar,
  Lock,
  Users,
  Target,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface VisualGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchVoice: () => void;
  onLaunchWebhook: () => void;
  onLaunchRls: () => void;
  onLaunchBragSheet: () => void;
}

export const VisualGuideModal: React.FC<VisualGuideModalProps> = ({
  isOpen,
  onClose,
  onLaunchVoice,
  onLaunchWebhook,
  onLaunchRls,
  onLaunchBragSheet,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'intro',
      tag: 'Overview',
      title: 'Welcome to ImpactIQ',
      subtitle: 'The Engineering Performance & 1:1 Copilot Platform',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            Most engineering performance reviews suffer from <strong>recency bias</strong>, unquantified activity, and painful 1:1 preparation. <strong>ImpactIQ</strong> automates the entire lifecycle from raw technical commits to promotion-grade executive Brag Sheets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-stone-900">Multi-Channel Intake</h4>
              <p className="text-[11px] text-stone-600">Voice memos, GitHub PR merges, and Jira ticket webhooks.</p>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-stone-900">LLM Distillation</h4>
              <p className="text-[11px] text-stone-600">Trivia filtered out; converted to Google XYZ impact statements.</p>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-stone-900">PostgreSQL RLS</h4>
              <p className="text-[11px] text-stone-600">Strict organizational tree isolation &amp; private drafts.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'personas',
      tag: 'Architecture',
      title: 'Two Distinct Personas & Reporting Tree',
      subtitle: 'Employee (IC) vs. Engineering Manager (EM) Workspaces',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            ImpactIQ adapts its entire user interface and database authorization rules depending on which persona you select from the top-right menu:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Employee Persona (Alex Rivera - IC)</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 pl-4 list-disc">
                <li><strong>Private Workspace:</strong> New updates are saved as private drafts.</li>
                <li><strong>Approval Gate:</strong> Manager cannot see drafts until you approve them.</li>
                <li><strong>Quarterly OKRs:</strong> Track personal pacing and progress bars.</li>
                <li><strong>One-Click Brag Sheet:</strong> Export promotion reports in Markdown/JSON/PDF.</li>
              </ul>
            </div>
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Manager Persona (Sarah Lin - EM)</span>
              </div>
              <ul className="text-xs text-indigo-800 space-y-1 pl-4 list-disc">
                <li><strong>Team Overview:</strong> Direct reports only (Alex, Elena, Marcus).</li>
                <li><strong>Stalled Objectives:</strong> Automated alert for goals idle &gt;7 days.</li>
                <li><strong>Private Coaching:</strong> Confidential notes shielded from ICs by RLS.</li>
                <li><strong>1:1 Copilot:</strong> Automated collaborative agendas with AI talking points.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'voice',
      tag: 'Feature A',
      title: 'In-Browser English Voice Update Widget',
      subtitle: 'Speak your updates naturally; AI formats the business impact',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            Engineers rarely write down daily wins. The in-browser voice recorder enables quick audio capture with real-time waveform visualization and multi-engine transcription.
          </p>
          <div className="p-4 bg-stone-900 text-stone-200 rounded-xl space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-stone-400">
              <span>VOICE INTAKE PIPELINE</span>
              <span className="text-emerald-400 font-bold">WHISPER / DEEPGRAM / GEMINI</span>
            </div>
            <p className="text-stone-300 font-sans">
              "Spent yesterday diagnosing the memory leak in the WebSocket gateway... footprint dropped from 2.4GB to 380MB."
            </p>
            <div className="text-[11px] text-amber-400 pt-1">
              → AI Output: "Stabilized WebSocket gateway memory footprint by 84%..." [Auto-linked to Platform Reliability Goal]
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onLaunchVoice();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Try Live Voice Recording Now</span>
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'webhooks',
      tag: 'Feature B',
      title: 'Mockable Webhook Hub (GitHub & Jira)',
      subtitle: 'Real-time ingestion of PR merges, commit logs, and resolved tickets',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            ImpactIQ features live HTTP endpoints listening for GitHub PR and Jira events. You can test them via the built-in simulator or directly from your terminal using <code className="text-xs bg-stone-100 p-1 rounded font-mono font-bold">curl</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="font-bold text-stone-900 block mb-1">GitHub PR Webhook</span>
              <p className="text-stone-600">Listens for <code>pull_request.closed</code> (merged) and commit pushes. Ingests diff stats and commits.</p>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="font-bold text-stone-900 block mb-1">Jira Issue Webhook</span>
              <p className="text-stone-600">Listens for <code>jira:issue_updated</code> status transitions (Resolved/Done), story points, and epics.</p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onLaunchWebhook();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Simulate Webhook Event</span>
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'llm',
      tag: 'Feature C',
      title: 'LLM Impact Distillation Pipeline',
      subtitle: 'Powered by Gemini 3.8 Flash (Trivia Stripping & Google XYZ Formulation)',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            The LLM pipeline cleans raw developer activity into executive-ready business impact statements:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Trivia Elimination:</strong> Routine chore noise (fixing linter errors, updating lockfile versions, rebasing branches) is automatically detected and stripped out.
              </div>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Google XYZ Formula:</strong> "Accomplished [X], as measured by [Y], by doing [Z]" (e.g. <em>Reduced p99 checkout latency by 41% under 27,000 RPS by implementing Redis caching...</em>).
              </div>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Quarterly Goal Auto-Linking:</strong> Semantically matches the activity to active OKRs and attaches confidence scores (e.g., 95% Match).
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'workspace',
      tag: 'Feature D',
      title: 'Employee Private Workspace & Approval Gate',
      subtitle: 'Draft isolation guarantees full control before sharing with management',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            Individual Contributors have a private staging area where all AI-distilled items land as <strong>Drafts</strong>:
          </p>
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>RLS Draft Privacy Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Engineering Managers <strong>cannot query or view draft achievements</strong>. Only after you review the statement, edit metrics, and click <strong>"Approve &amp; Share to EM"</strong> does the status update to <code>approved</code>, making it visible to your manager.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'manager',
      tag: 'Feature E & F',
      title: 'Manager Team Health & Stalled Objectives',
      subtitle: 'Hierarchical team overview, blocker alerts, and confidential coaching notes',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            When logged in as Engineering Manager (Sarah Lin), you receive a dedicated executive dashboard:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-950">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Stalled Objectives Alert</span>
              </div>
              <p className="text-rose-800">
                Highlights objectives inactive for &gt;7 days (e.g. Marcus Chen's eBPF migration: 29d inactive) with a one-click <strong>"Add to 1:1"</strong> button.
              </p>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Confidential Coaching Notes</span>
              </div>
              <p className="text-stone-600">
                Manager-only private notes for promotion calibration and mentorship. Strictly inaccessible to employees under PostgreSQL RLS.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'copilot',
      tag: 'Feature G',
      title: 'Automated 1:1 Copilot Agenda Synthesizer',
      subtitle: 'Never show up unprepared: AI curates talking points and mutual action items',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            The 1:1 Copilot synthesizes recent approved achievements, stalled goals, and coaching themes into an aligned bi-weekly agenda:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">Celebration Talking Points:</span> Acknowledges verified engineering wins.
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase text-[10px]">Celebration</span>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">Blocker Resolution:</span> Unblocks stalled dependencies with direct escalation.
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold uppercase text-[10px]">Blocker</span>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">Mutual Action Items:</span> Checklists assigned to Employee or Manager with due dates.
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold uppercase text-[10px]">Action</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rls',
      tag: 'Feature H',
      title: 'PostgreSQL Row-Level Security (RLS) Policy Inspector',
      subtitle: 'Database-enforced organizational tree isolation & live policy testbench',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            ImpactIQ enforces real security at the database row level. Managers can only query direct reports in their tree; unapproved drafts and coaching notes are protected by SQL policies:
          </p>
          <div className="p-3 bg-stone-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
            <code>
              CREATE POLICY manager_direct_approved ON achievements<br />
              &nbsp;&nbsp;FOR SELECT USING (<br />
              &nbsp;&nbsp;&nbsp;&nbsp;status = 'approved' AND<br />
              &nbsp;&nbsp;&nbsp;&nbsp;auth.uid() = (SELECT manager_id FROM users WHERE id = user_id)<br />
              &nbsp;&nbsp;);
            </code>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onLaunchRls();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Interactive RLS Policy Testbench</span>
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'bragsheet',
      tag: 'Feature I',
      title: 'One-Click Quarterly "Brag Sheet" Studio',
      subtitle: 'Export executive performance review documents in Markdown, JSON, and PDF',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            At performance review and promotion calibration time, click <strong>"Brag Sheet"</strong> to compile all verified accomplishments into a polished executive dossier:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <span className="font-bold text-stone-900 block mb-1">Copy Markdown</span>
              <p className="text-stone-600">Paste directly into Lattice, Workday, or Google Docs.</p>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <span className="font-bold text-stone-900 block mb-1">Export JSON</span>
              <p className="text-stone-600">Structured data via <code>GET /api/brag-sheet/:userId</code>.</p>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <span className="font-bold text-stone-900 block mb-1">Print / PDF</span>
              <p className="text-stone-600">Executive typography formatted for one-click PDF printing.</p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onLaunchBragSheet();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Generate Q3 Brag Sheet Now</span>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide(c => c + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(c => c - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide, slides.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                ImpactIQ Visual Guide &amp; Masterclass (A to Z)
              </h3>
              <p className="text-[11px] text-stone-500">
                Interactive walkthrough &amp; architecture presentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-stone-400">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono">
              {slide.tag}
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">
              {slide.title}
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {slide.subtitle}
            </p>
          </div>

          <div className="pt-2">{slide.content}</div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => setCurrentSlide(c => Math.max(0, c - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-6 bg-stone-900'
                    : 'bg-stone-300 hover:bg-stone-400'
                }`}
                title={s.title}
              />
            ))}
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide(c => Math.min(slides.length - 1, c + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Start Exploring ImpactIQ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
