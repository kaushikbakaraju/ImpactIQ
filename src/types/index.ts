export type Role = 'IC' | 'EM' | 'DIRECTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatar: string;
  managerId?: string | null;
  department: string;
  team: string;
}

export type GoalHealth = 'on-track' | 'needs-attention' | 'stalled' | 'completed';

export interface QuarterlyGoal {
  id: string;
  userId: string;
  quarter: string; // e.g. "Q3 2026"
  title: string;
  description: string;
  category: 'Reliability & Infra' | 'Product Velocity' | 'Platform Security' | 'Developer Experience' | 'Team & Mentorship';
  targetMetric: string;
  currentMetric: string;
  progressPercent: number;
  health: GoalHealth;
  lastUpdated: string;
  daysSinceLastActivity: number;
}

export type AchievementSource = 'voice' | 'github_pr' | 'jira_ticket' | 'manual';
export type AchievementStatus = 'draft' | 'approved'; // Draft is strictly private to IC under RLS; Approved is shared to EM

export interface Achievement {
  id: string;
  userId: string;
  source: AchievementSource;
  rawInput: string;
  sourceReference?: string; // PR #342, JIRA-109, etc.
  title: string;
  businessImpactStatement: string; // Google XYZ or STAR format
  technicalCraftSummary: string;
  quantifiedMetrics: string[]; // ["-34% p99 latency", "+12k daily active streams"]
  linkedGoalId?: string;
  goalMatchConfidence?: number; // 0-100
  goalMatchReasoning?: string;
  status: AchievementStatus;
  createdAt: string;
  approvedAt?: string;
  triviaFilteredOut: string[];
  tags: string[];
}

export interface CoachingNote {
  id: string;
  managerId: string;
  employeeId: string;
  note: string;
  tags: string[];
  sentiment: 'positive' | 'growth' | 'neutral' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  type: 'celebration' | 'blocker' | 'growth' | 'strategy';
  aiSuggested: boolean;
  completed: boolean;
  suggestedBy?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assigneeId: string;
  dueDate: string;
  completed: boolean;
}

export interface OneOnOneAgenda {
  id: string;
  employeeId: string;
  managerId: string;
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  executiveSummary: string;
  talkingPoints: AgendaItem[];
  blockers: string[];
  actionItems: ActionItem[];
  sharedNotes: string;
  createdAt: string;
  lastSynthesizedAt?: string;
}

export interface WebhookEvent {
  id: string;
  source: 'github' | 'jira';
  eventType: string;
  timestamp: string;
  sender: string;
  summary: string;
  payload: Record<string, any>;
  processed: boolean;
  resultingAchievementId?: string;
}

export interface RlsAuditCheck {
  id: string;
  timestamp: string;
  requestingUserId: string;
  requestingRole: Role;
  targetUserId: string;
  resource: 'achievements' | 'goals' | 'coaching_notes' | 'one_on_one';
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  allowed: boolean;
  reason: string;
  policyName: string;
}
