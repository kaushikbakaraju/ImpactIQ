import {
  User,
  QuarterlyGoal,
  Achievement,
  CoachingNote,
  OneOnOneAgenda,
  WebhookEvent,
  RlsAuditCheck,
} from '../types';

// Mock Organizational Directory
export const INITIAL_USERS: User[] = [
  {
    id: 'user_mgr_1',
    name: 'Sarah Lin',
    email: 'sarah.lin@impactiq.io',
    role: 'EM',
    title: 'Director of Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering',
    team: 'Platform & Distributed Systems',
  },
  {
    id: 'user_ic_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@impactiq.io',
    role: 'IC',
    title: 'Staff Backend & Distributed Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    managerId: 'user_mgr_1',
    department: 'Engineering',
    team: 'Core Infrastructure',
  },
  {
    id: 'user_ic_2',
    name: 'Elena Rostova',
    email: 'elena.rostova@impactiq.io',
    role: 'IC',
    title: 'Senior Distributed Data Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    managerId: 'user_mgr_1',
    department: 'Engineering',
    team: 'Storage & Streaming',
  },
  {
    id: 'user_ic_3',
    name: 'Marcus Chen',
    email: 'marcus.chen@impactiq.io',
    role: 'IC',
    title: 'Full-Stack Performance Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    managerId: 'user_mgr_1',
    department: 'Engineering',
    team: 'Core Infrastructure',
  },
  {
    id: 'user_mgr_2',
    name: 'David Kim',
    email: 'david.kim@impactiq.io',
    role: 'EM',
    title: 'Engineering Manager - Growth & Mobile',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering',
    team: 'Growth Apps',
  },
  {
    id: 'user_ic_4',
    name: 'Priya Sharma',
    email: 'priya.sharma@impactiq.io',
    role: 'IC',
    title: 'Principal Frontend Architect',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    managerId: 'user_mgr_2',
    department: 'Engineering',
    team: 'Growth Apps',
  },
];

// Initial Quarterly Goals (Q3 2026)
export const INITIAL_GOALS: QuarterlyGoal[] = [
  // Alex Rivera's Goals
  {
    id: 'goal_alex_1',
    userId: 'user_ic_1',
    quarter: 'Q3 2026',
    title: 'Sub-100ms P99 Latency on High-Throughput Checkout APIs',
    description: 'Optimize Postgres read replicas, connection pooling, and multi-tier Redis caching to bring checkout API latency under 100ms at 25k RPS.',
    category: 'Reliability & Infra',
    targetMetric: 'p99 < 100ms @ 25k RPS',
    currentMetric: 'p99 = 88ms @ 27k RPS',
    progressPercent: 92,
    health: 'on-track',
    lastUpdated: '2026-10-24T14:30:00Z',
    daysSinceLastActivity: 3,
  },
  {
    id: 'goal_alex_2',
    userId: 'user_ic_1',
    quarter: 'Q3 2026',
    title: 'Zero-Downtime PostgreSQL Schema Migration Framework',
    description: 'Establish automated rollback-safe blue/green migration runner with lock timeouts, avoiding table-level exclusive locks during deployment.',
    category: 'Developer Experience',
    targetMetric: '100% automated migrations with 0 locks >250ms',
    currentMetric: '6 of 8 microservices migrated',
    progressPercent: 75,
    health: 'on-track',
    lastUpdated: '2026-10-20T10:15:00Z',
    daysSinceLastActivity: 7,
  },
  {
    id: 'goal_alex_3',
    userId: 'user_ic_1',
    quarter: 'Q3 2026',
    title: 'Multi-Region Disaster Recovery & Automated Failover Drills',
    description: 'Validate active-active database replication between us-east and eu-central regions with cross-region synthetic smoke test runner.',
    category: 'Platform Security',
    targetMetric: 'RTO < 3 min, RPO < 10 sec validated',
    currentMetric: 'Blocked on staging IAM cross-tenant VPC peering',
    progressPercent: 20,
    health: 'stalled',
    lastUpdated: '2026-10-02T16:00:00Z',
    daysSinceLastActivity: 25,
  },

  // Elena Rostova's Goals
  {
    id: 'goal_elena_1',
    userId: 'user_ic_2',
    quarter: 'Q3 2026',
    title: 'Kafka to Apache Iceberg Real-Time Lakehouse Ingestion',
    description: 'Stream 1.2B events/day with 15-minute table compaction and transactional guarantees.',
    category: 'Reliability & Infra',
    targetMetric: '1.2B events/day, <15min lag',
    currentMetric: '1.4B events/day, 9min lag',
    progressPercent: 95,
    health: 'on-track',
    lastUpdated: '2026-10-26T11:00:00Z',
    daysSinceLastActivity: 1,
  },
  {
    id: 'goal_elena_2',
    userId: 'user_ic_2',
    quarter: 'Q3 2026',
    title: 'Distributed Tracing & OpenTelemetry Semantic Conformance',
    description: 'Propagate trace contexts across all gRPC and HTTP asynchronous consumers.',
    category: 'Platform Security',
    targetMetric: '100% trace coverage on payment boundaries',
    currentMetric: '65% completed',
    progressPercent: 65,
    health: 'needs-attention',
    lastUpdated: '2026-10-18T09:00:00Z',
    daysSinceLastActivity: 9,
  },

  // Marcus Chen's Goals
  {
    id: 'goal_marcus_1',
    userId: 'user_ic_3',
    quarter: 'Q3 2026',
    title: 'Next-Gen Platform Service Mesh Migration (Envoy & Cilium)',
    description: 'Replace legacy ingress with eBPF powered mesh for dynamic circuit breaking and mTLS.',
    category: 'Reliability & Infra',
    targetMetric: 'Migrate 14 clusters to eBPF mesh',
    currentMetric: 'Halted due to kernel compatibility bugs on node pool',
    progressPercent: 15,
    health: 'stalled',
    lastUpdated: '2026-09-28T14:00:00Z',
    daysSinceLastActivity: 29,
  },
];

// Initial Achievements
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_alex_1',
    userId: 'user_ic_1',
    source: 'github_pr',
    sourceReference: 'PR #1042',
    rawInput: 'Merged pull request #1042: add composite index on (tenant_id, created_at, status) for transactions table and implement tiered redis cache with 30s TTL. Fixes slow query alert during flash sale spikes.',
    title: 'Sub-100ms Checkout Query Optimization',
    businessImpactStatement: 'Reduced p99 checkout API latency by 41% (from 148ms down to 88ms) under 27,000 RPS peak load by introducing composite indexes and adaptive Redis read-through caching, directly preventing transaction drops during flash sales.',
    technicalCraftSummary: 'Analyzed pg_stat_statements slow query log; authored non-blocking concurrent composite index migration; implemented Redis TTL with jitter to prevent cache stampedes.',
    quantifiedMetrics: ['-41% p99 latency', '27,000 RPS sustained', '0 dropped transactions'],
    linkedGoalId: 'goal_alex_1',
    goalMatchConfidence: 98,
    goalMatchReasoning: 'Directly advances p99 latency targets on checkout service by tackling the top database bottleneck.',
    status: 'approved',
    createdAt: '2026-10-24T14:30:00Z',
    approvedAt: '2026-10-24T15:00:00Z',
    triviaFilteredOut: ['Fixed lint warning in db/index.ts', 'Bumped ts-node dev dependency', 'Rebased on main branch'],
    tags: ['PostgreSQL', 'Redis', 'Performance', 'Latency'],
  },
  {
    id: 'ach_alex_2',
    userId: 'user_ic_1',
    source: 'jira_ticket',
    sourceReference: 'PLAT-884',
    rawInput: 'Jira issue PLAT-884 resolved: built safety guardrails into migration pipeline with automatic lock timeouts (250ms) and pre-flight validation to abort if tables have active long-running transactions.',
    title: 'Automated Migration Lock Safety Runner',
    businessImpactStatement: 'Eliminated incident risks from database deployments by engineering an automated pre-flight lock-guard runner, protecting 6 production microservices from cascading lock starvation outages.',
    technicalCraftSummary: 'Implemented PostgreSQL pg_locks polling daemon with 250ms statement timeouts and rollback automation in Python/TypeScript CI pipeline.',
    quantifiedMetrics: ['0 deployment locking incidents', '6 microservices guarded', '<250ms max acquire lock time'],
    linkedGoalId: 'goal_alex_2',
    goalMatchConfidence: 94,
    goalMatchReasoning: 'Fulfills the zero-downtime PostgreSQL schema migration safety criteria.',
    status: 'approved',
    createdAt: '2026-10-20T10:15:00Z',
    approvedAt: '2026-10-20T11:00:00Z',
    triviaFilteredOut: ['Updated README instructions', 'Changed variable name from t_out to timeoutSeconds'],
    tags: ['CI/CD', 'PostgreSQL', 'Reliability'],
  },
  {
    id: 'ach_alex_draft_1',
    userId: 'user_ic_1',
    source: 'voice',
    sourceReference: 'Voice memo Oct 28',
    rawInput: 'Hey, quick update. Spent yesterday diagnosing the memory leak in the WebSocket gateway. Turned out clients that disconnect abruptly were holding circular references in the connection pool. Patched the event listener cleanup and memory footprint stabilized under 400MB. Saved our cluster from nightly autoscaler thrashing.',
    title: 'WebSocket Connection Pool Memory Leak Fix',
    businessImpactStatement: 'Stabilized WebSocket gateway memory footprint from uncontrolled 2.4GB spikes down to a steady 380MB, stopping nightly cluster autoscaler thrashing and reducing cluster node count by 4 instances ($1,850/mo savings).',
    technicalCraftSummary: 'Audited heap snapshots via Chrome DevTools and Node.js inspector; eliminated circular listener references in disconnection lifecycle handler; authored leak regression unit test.',
    quantifiedMetrics: ['-84% memory consumption (2.4GB -> 380MB)', '$1,850/mo infrastructure cost reduction', 'Zero pod evictions'],
    linkedGoalId: 'goal_alex_1',
    goalMatchConfidence: 89,
    goalMatchReasoning: 'Enhances overall platform service reliability and system throughput.',
    status: 'draft', // Private in Employee workspace until approved!
    createdAt: '2026-10-28T18:20:00Z',
    triviaFilteredOut: ['Complained about local brew setup', 'Mentioned ordering coffee'],
    tags: ['WebSockets', 'Memory Profiling', 'Node.js', 'Cost Optimization'],
  },

  // Elena's approved achievement
  {
    id: 'ach_elena_1',
    userId: 'user_ic_2',
    source: 'github_pr',
    sourceReference: 'PR #891',
    rawInput: 'Merged PR #891: Apache Iceberg streaming sink with Z-Order clustering on timestamp and customer_id columns for 10x faster analytical slice queries.',
    title: 'Real-Time Apache Iceberg Z-Order Sink',
    businessImpactStatement: 'Cut analytical data lake query latencies by 82% across 1.4B daily events by implementing Apache Iceberg Z-order indexing on the streaming ingest pipeline.',
    technicalCraftSummary: 'Engineered custom Iceberg catalog commit orchestrator with parallelized S3 file compaction.',
    quantifiedMetrics: ['-82% query time', '1.4B events/day streaming', '15-min SLA guaranteed'],
    linkedGoalId: 'goal_elena_1',
    goalMatchConfidence: 96,
    goalMatchReasoning: 'Matches Kafka to Apache Iceberg lakehouse ingestion throughput goals.',
    status: 'approved',
    createdAt: '2026-10-25T16:00:00Z',
    approvedAt: '2026-10-25T17:00:00Z',
    triviaFilteredOut: ['Adjusted indentation', 'Merged release branch notes'],
    tags: ['Apache Iceberg', 'Kafka', 'Streaming', 'Data Lake'],
  },
];

// Initial Private Coaching Notes (Accessible ONLY to the Manager!)
export const INITIAL_COACHING_NOTES: CoachingNote[] = [
  {
    id: 'note_1',
    managerId: 'user_mgr_1',
    employeeId: 'user_ic_1', // Alex Rivera
    note: 'Alex demonstrated outstanding technical depth resolving the checkout p99 bottleneck. Next growth step for Staff+ promotion is mentoring Marcus on distributed locks and driving cross-team alignment on the multi-region DR architecture rather than doing all coding solo.',
    tags: ['Staff Promotion', 'Mentorship', 'Cross-Team Leadership'],
    sentiment: 'positive',
    createdAt: '2026-10-22T09:30:00Z',
    updatedAt: '2026-10-22T09:30:00Z',
  },
  {
    id: 'note_2',
    managerId: 'user_mgr_1',
    employeeId: 'user_ic_3', // Marcus Chen
    note: 'Marcus is feeling blocked on the eBPF mesh migration due to kernel bugs. Need to pair him with Alex or request upstream help from the Infrastructure Platform team to avoid burn-out and get the objective unstuck.',
    tags: ['Blocker Support', 'Objective Health', 'Paired Engineering'],
    sentiment: 'urgent',
    createdAt: '2026-10-21T11:00:00Z',
    updatedAt: '2026-10-21T11:00:00Z',
  },
];

// Initial 1:1 Agenda
export const INITIAL_AGENDAS: OneOnOneAgenda[] = [
  {
    id: 'agenda_alex_sarah_1',
    employeeId: 'user_ic_1',
    managerId: 'user_mgr_1',
    scheduledDate: '2026-11-02T10:00:00Z',
    status: 'scheduled',
    executiveSummary: 'Bi-weekly 1:1 sync focusing on the checkout latency wins (p99 < 88ms), unblocking the stalled Multi-Region Disaster Recovery goal, and discussing Staff Engineer promotion milestone documentation.',
    talkingPoints: [
      {
        id: 'tp_1',
        title: 'Review Checkout p99 Latency Wins & Production Metrics',
        description: 'Celebrate PR #1042 outcome (-41% latency under 27k RPS). Discuss rollout to secondary regions.',
        type: 'celebration',
        aiSuggested: true,
        completed: false,
        suggestedBy: 'ImpactIQ Copilot',
      },
      {
        id: 'tp_2',
        title: 'Unblock Stalled Multi-Region DR Objective (25 Days Stalled)',
        description: 'Action required: Escalate cross-tenant VPC peering ticket with Staging Cloud Infra team.',
        type: 'blocker',
        aiSuggested: true,
        completed: false,
        suggestedBy: 'ImpactIQ Copilot',
      },
      {
        id: 'tp_3',
        title: 'Mentoring Marcus on Distributed Locks & Async Ingestion',
        description: 'Pairing opportunity on eBPF & connection pool lifecycle.',
        type: 'growth',
        aiSuggested: true,
        completed: false,
        suggestedBy: 'ImpactIQ Copilot',
      },
    ],
    blockers: [
      'Multi-region DR stalled on staging IAM cross-tenant VPC peering review with SecOps',
    ],
    actionItems: [
      {
        id: 'act_1',
        task: 'Sarah to ping SecOps lead to expedite VPC peering ticket approval by Wednesday',
        assigneeId: 'user_mgr_1',
        dueDate: '2026-11-04',
        completed: false,
      },
      {
        id: 'act_2',
        task: 'Alex to review approved achievements for Q3 Brag Sheet draft submission',
        assigneeId: 'user_ic_1',
        dueDate: '2026-11-06',
        completed: false,
      },
    ],
    sharedNotes: 'Collaborative notes will be captured during the 1:1 conversation.',
    createdAt: '2026-10-27T09:00:00Z',
    lastSynthesizedAt: '2026-10-28T09:00:00Z',
  },
];

// In-Memory Database State with LocalStorage Persistence
class ImpactIQStore {
  private users: User[] = INITIAL_USERS;
  private goals: QuarterlyGoal[] = INITIAL_GOALS;
  private achievements: Achievement[] = INITIAL_ACHIEVEMENTS;
  private coachingNotes: CoachingNote[] = INITIAL_COACHING_NOTES;
  private agendas: OneOnOneAgenda[] = INITIAL_AGENDAS;
  private webhooks: WebhookEvent[] = [];
  private auditLogs: RlsAuditCheck[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('impactiq_achievements', JSON.stringify(this.achievements));
      localStorage.setItem('impactiq_goals', JSON.stringify(this.goals));
      localStorage.setItem('impactiq_notes', JSON.stringify(this.coachingNotes));
      localStorage.setItem('impactiq_agendas', JSON.stringify(this.agendas));
      localStorage.setItem('impactiq_webhooks', JSON.stringify(this.webhooks));
      localStorage.setItem('impactiq_audits', JSON.stringify(this.auditLogs.slice(-50)));
    } catch {
      // Storage quota or SSR fallback
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const ach = localStorage.getItem('impactiq_achievements');
      if (ach) this.achievements = JSON.parse(ach);

      const g = localStorage.getItem('impactiq_goals');
      if (g) this.goals = JSON.parse(g);

      const n = localStorage.getItem('impactiq_notes');
      if (n) this.coachingNotes = JSON.parse(n);

      const ag = localStorage.getItem('impactiq_agendas');
      if (ag) this.agendas = JSON.parse(ag);

      const wb = localStorage.getItem('impactiq_webhooks');
      if (wb) this.webhooks = JSON.parse(wb);

      const aud = localStorage.getItem('impactiq_audits');
      if (aud) this.auditLogs = JSON.parse(aud);
    } catch {
      // fall back to defaults
    }
  }

  public resetToDefaults() {
    this.users = [...INITIAL_USERS];
    this.goals = [...INITIAL_GOALS];
    this.achievements = [...INITIAL_ACHIEVEMENTS];
    this.coachingNotes = [...INITIAL_COACHING_NOTES];
    this.agendas = [...INITIAL_AGENDAS];
    this.webhooks = [];
    this.auditLogs = [];
    this.saveToStorage();
  }

  // --- Organizational Tree & User Directory ---
  public getUsers(): User[] {
    return this.users;
  }

  public getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getDirectReports(managerId: string): User[] {
    return this.users.filter(u => u.managerId === managerId);
  }

  public isDirectReport(managerId: string, employeeId: string): boolean {
    const employee = this.getUser(employeeId);
    return employee?.managerId === managerId;
  }

  // --- Strict Row-Level Security (RLS) Query Evaluator ---
  // Replicating PostgreSQL RLS Policies:
  // POLICY 1: "employee_own_records" ON achievements FOR SELECT USING (auth.uid() = user_id)
  // POLICY 2: "manager_direct_approved_records" ON achievements FOR SELECT USING (auth.uid() = (SELECT manager_id FROM users WHERE id = achievements.user_id) AND status = 'approved')

  public queryAchievements(requestingUserId: string, targetUserId: string): { data: Achievement[]; allowed: boolean; violationReason?: string } {
    const requestingUser = this.getUser(requestingUserId);
    if (!requestingUser) {
      return { data: [], allowed: false, violationReason: 'User not authenticated' };
    }

    // Case 1: Employee reading their own achievements -> Full access (Drafts + Approved)
    if (requestingUserId === targetUserId) {
      const results = this.achievements.filter(a => a.userId === targetUserId);
      this.logAudit({
        requestingUserId,
        requestingRole: requestingUser.role,
        targetUserId,
        resource: 'achievements',
        action: 'SELECT',
        allowed: true,
        reason: 'Granted: Employee reading own records via auth.uid() = user_id (includes drafts)',
        policyName: 'employee_own_records',
      });
      return { data: results, allowed: true };
    }

    // Case 2: Manager querying a direct report -> Filter out 'draft' records (Only 'approved' visible)
    const isReport = this.isDirectReport(requestingUserId, targetUserId);
    if (isReport) {
      const results = this.achievements.filter(a => a.userId === targetUserId && a.status === 'approved');
      this.logAudit({
        requestingUserId,
        requestingRole: requestingUser.role,
        targetUserId,
        resource: 'achievements',
        action: 'SELECT',
        allowed: true,
        reason: 'Granted: Manager querying direct report tree. Drafts suppressed by RLS policy.',
        policyName: 'manager_direct_approved_records',
      });
      return { data: results, allowed: true };
    }

    // Case 3: Violation! Trying to access another person who is not a direct report
    this.logAudit({
      requestingUserId,
      requestingRole: requestingUser.role,
      targetUserId,
      resource: 'achievements',
      action: 'SELECT',
      allowed: false,
      reason: `RLS Denied: User ${requestingUser.name} (${requestingUser.role}) is NOT in the direct reporting path for target ${targetUserId}`,
      policyName: 'hierarchical_tree_isolation_enforced',
    });

    return {
      data: [],
      allowed: false,
      violationReason: `RLS Security Violation: You do not have permission to query achievements outside your direct reporting hierarchy.`,
    };
  }

  // --- Goals Query (RLS) ---
  public queryGoals(requestingUserId: string, targetUserId: string): { data: QuarterlyGoal[]; allowed: boolean } {
    const requestingUser = this.getUser(requestingUserId);
    const allowed = requestingUserId === targetUserId || this.isDirectReport(requestingUserId, targetUserId);

    this.logAudit({
      requestingUserId,
      requestingRole: requestingUser?.role || 'IC',
      targetUserId,
      resource: 'goals',
      action: 'SELECT',
      allowed,
      reason: allowed
        ? 'Granted: Own goals or direct reporting tree access'
        : 'RLS Denied: Cross-team goal query blocked',
      policyName: 'goals_hierarchy_policy',
    });

    if (!allowed) return { data: [], allowed: false };
    return { data: this.goals.filter(g => g.userId === targetUserId), allowed: true };
  }

  // --- Manager Coaching Notes (RLS: Strictly private to authoring Manager) ---
  public queryCoachingNotes(requestingUserId: string, employeeId: string): { data: CoachingNote[]; allowed: boolean } {
    const requestingUser = this.getUser(requestingUserId);
    // An IC cannot read their manager's coaching notes on them!
    if (requestingUserId === employeeId && requestingUser?.role === 'IC') {
      this.logAudit({
        requestingUserId,
        requestingRole: requestingUser.role,
        targetUserId: employeeId,
        resource: 'coaching_notes',
        action: 'SELECT',
        allowed: false,
        reason: 'RLS Denied: IC cannot read manager confidential coaching notes',
        policyName: 'manager_confidential_coaching_notes',
      });
      return { data: [], allowed: false };
    }

    // Manager can read if they manage this employee
    if (this.isDirectReport(requestingUserId, employeeId)) {
      this.logAudit({
        requestingUserId,
        requestingRole: requestingUser?.role || 'EM',
        targetUserId: employeeId,
        resource: 'coaching_notes',
        action: 'SELECT',
        allowed: true,
        reason: 'Granted: Authoring EM viewing confidential coaching notes for direct report',
        policyName: 'manager_confidential_coaching_notes',
      });
      return {
        data: this.coachingNotes.filter(n => n.managerId === requestingUserId && n.employeeId === employeeId),
        allowed: true,
      };
    }

    return { data: [], allowed: false };
  }

  public saveCoachingNote(note: Omit<CoachingNote, 'id' | 'createdAt' | 'updatedAt'>): CoachingNote {
    const newNote: CoachingNote = {
      ...note,
      id: 'note_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.coachingNotes.unshift(newNote);
    this.saveToStorage();
    return newNote;
  }

  // --- Achievement CRUD & Workflow ---
  public addAchievement(item: Omit<Achievement, 'id' | 'createdAt'>): Achievement {
    const newAch: Achievement = {
      ...item,
      id: 'ach_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.achievements.unshift(newAch);
    this.saveToStorage();
    return newAch;
  }

  public approveAchievement(achievementId: string, requestingUserId: string): Achievement | null {
    const ach = this.achievements.find(a => a.id === achievementId);
    if (!ach) return null;
    if (ach.userId !== requestingUserId) {
      throw new Error('RLS Violation: Only the owner IC can approve their achievement for management sharing.');
    }

    ach.status = 'approved';
    ach.approvedAt = new Date().toISOString();
    this.saveToStorage();

    this.logAudit({
      requestingUserId,
      requestingRole: 'IC',
      targetUserId: requestingUserId,
      resource: 'achievements',
      action: 'UPDATE',
      allowed: true,
      reason: 'IC approved draft; record is now shared and visible to direct EM under RLS policy.',
      policyName: 'employee_approve_and_share',
    });

    return ach;
  }

  public updateAchievement(achievementId: string, updates: Partial<Achievement>, requestingUserId: string): Achievement | null {
    const ach = this.achievements.find(a => a.id === achievementId);
    if (!ach) return null;
    if (ach.userId !== requestingUserId) {
      throw new Error('RLS Violation: Cannot modify another user achievement.');
    }
    Object.assign(ach, updates);
    this.saveToStorage();
    return ach;
  }

  public deleteAchievement(achievementId: string, requestingUserId: string): boolean {
    const index = this.achievements.findIndex(a => a.id === achievementId);
    if (index === -1) return false;
    if (this.achievements[index].userId !== requestingUserId) {
      throw new Error('RLS Violation: Cannot delete another user achievement.');
    }
    this.achievements.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // --- 1:1 Agendas ---
  public queryAgendas(employeeId: string, managerId: string): OneOnOneAgenda[] {
    return this.agendas.filter(a => a.employeeId === employeeId && a.managerId === managerId);
  }

  public saveAgenda(agenda: OneOnOneAgenda) {
    const index = this.agendas.findIndex(a => a.id === agenda.id);
    if (index >= 0) {
      this.agendas[index] = agenda;
    } else {
      this.agendas.unshift(agenda);
    }
    this.saveToStorage();
  }

  // --- Webhook Logs ---
  public logWebhook(event: Omit<WebhookEvent, 'id' | 'timestamp'>): WebhookEvent {
    const wb: WebhookEvent = {
      ...event,
      id: 'wh_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.webhooks.unshift(wb);
    if (this.webhooks.length > 30) this.webhooks.pop();
    this.saveToStorage();
    return wb;
  }

  public getWebhooks(): WebhookEvent[] {
    return this.webhooks;
  }

  // --- RLS Audit Logs ---
  private logAudit(entry: Omit<RlsAuditCheck, 'id' | 'timestamp'>) {
    const audit: RlsAuditCheck = {
      ...entry,
      id: 'rls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(audit);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
    this.saveToStorage();
  }

  public getAuditLogs(): RlsAuditCheck[] {
    return this.auditLogs;
  }

  // --- Goals Updates ---
  public updateGoalProgress(goalId: string, currentMetric: string, progressPercent: number, health: QuarterlyGoal['health']) {
    const g = this.goals.find(goal => goal.id === goalId);
    if (g) {
      g.currentMetric = currentMetric;
      g.progressPercent = progressPercent;
      g.health = health;
      g.lastUpdated = new Date().toISOString();
      g.daysSinceLastActivity = 0;
      this.saveToStorage();
    }
  }
}

export const dbStore = new ImpactIQStore();
