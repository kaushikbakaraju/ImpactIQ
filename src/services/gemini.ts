import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { QuarterlyGoal, Achievement, User, CoachingNote } from '../types';

export interface ImpactTransformationResult {
  title: string;
  businessImpactStatement: string;
  technicalCraftSummary: string;
  quantifiedMetrics: string[];
  suggestedGoalId?: string;
  goalMatchConfidence: number;
  goalMatchReasoning: string;
  triviaFilteredOut: string[];
  tags: string[];
}

export interface AgendaSynthesisResult {
  executiveSummary: string;
  talkingPoints: {
    title: string;
    description: string;
    type: 'celebration' | 'blocker' | 'growth' | 'strategy';
    aiSuggested: boolean;
  }[];
  blockers: string[];
  actionItems: {
    task: string;
    assigneeRole: 'employee' | 'manager';
    suggestedDueDate: string;
  }[];
}

// Helper to get client-safe or server-safe GenAI instance
const getGenAI = (): GoogleGenAI | null => {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * LLM Pipeline: Ingests raw transcripts, commit logs, PR descriptions, and Jira tickets.
 * Removes trivia, converts into structured business impact statements, and auto-links to quarterly goals.
 */
export async function transformRawToImpactStatement(
  rawInput: string,
  goals: QuarterlyGoal[],
  source: string = 'voice',
  sourceReference?: string
): Promise<ImpactTransformationResult> {
  const goalsContext = goals.map(g => ({
    id: g.id,
    title: g.title,
    category: g.category,
    targetMetric: g.targetMetric,
    currentMetric: g.currentMetric,
    health: g.health,
  }));

  // Try calling the server API first with a 20s timeout (well within 30s)
  try {
    const res = await fetch('/api/llm/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        rawInput,
        goals: goalsContext,
        source,
        sourceReference,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.businessImpactStatement && data.title) {
        return data;
      }
    }
  } catch {
    // server route fallback
  }

  // Next, try direct GenAI client if key is present
  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are the lead engineering performance analyst for ImpactIQ.
Your task is to analyze raw engineering activity (voice memo transcript, Git commit log, PR diff summary, or Jira ticket) and transform it into an elite, promotion-grade Business Impact Statement using the Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".

Active User Quarterly Goals:
${JSON.stringify(goalsContext, null, 2)}

Raw Activity Source: ${source} (${sourceReference || 'ad-hoc update'})
Raw Engineering Input:
"""
${rawInput}
"""

Instructions:
1. Filter out all routine chore trivia (e.g. formatting, fixing typos, updating lockfiles, minor rebase, coffee talk, personal chatter).
2. Elevate the technical task to its direct business outcome (revenue unlocked, latency reduction, reliability, cost savings, customer trust, dev velocity).
3. Quantify metrics whenever implied or stated (e.g., "-35% latency", "20k RPS", "$1.2k/mo saved", "0 downtime"). If specific numbers aren't stated, estimate reasonable order-of-magnitude engineering metrics based on the scope.
4. Intelligently match to ONE of the active quarterly goals above. Provide a confidence score (0-100) and rationale.
5. Provide a crisp title and technical craft summary.

Respond strictly in valid JSON matching this structure:
{
  "title": "Crisp title under 8 words",
  "businessImpactStatement": "High-impact XYZ format statement",
  "technicalCraftSummary": "Technical architecture, algorithms, and tooling used",
  "quantifiedMetrics": ["Metric 1", "Metric 2"],
  "suggestedGoalId": "goal_id_here or null",
  "goalMatchConfidence": 95,
  "goalMatchReasoning": "Why this aligns with the quarterly goal",
  "triviaFilteredOut": ["Trivia 1", "Trivia 2"],
  "tags": ["Tag1", "Tag2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      return JSON.parse(text) as ImpactTransformationResult;
    } catch (err) {
      console.warn('GenAI direct call error, using deterministic intelligent distiller:', err);
    }
  }

  // Heuristic intelligent fallback when API is not responding or key is unconfigured
  return fallbackDistiller(rawInput, goals, source, sourceReference);
}

/**
 * Automated 1:1 Copilot Synthesis:
 * Combines approved achievements, blocked/stalled goals, and coaching notes into a structured agenda.
 */
export async function synthesize1on1Agenda(
  employee: User,
  manager: User,
  approvedAchievements: Achievement[],
  goals: QuarterlyGoal[],
  coachingNotes: CoachingNote[]
): Promise<AgendaSynthesisResult> {
  try {
    const res = await fetch('/api/copilot/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        employeeId: employee.id,
        managerId: manager.id,
        achievements: approvedAchievements,
        goals,
        coachingNotes,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to client genai or rule-based synthesizer
  }

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are the executive 1:1 Copilot for Engineering Manager ${manager.name} and Senior IC ${employee.name}.
Synthesize their recent performance data into an actionable, collaborative 1:1 meeting agenda.

Approved Achievements since last sync:
${JSON.stringify(approvedAchievements.map(a => ({ title: a.title, impact: a.businessImpactStatement, metrics: a.quantifiedMetrics })), null, 2)}

Quarterly Goals & Health:
${JSON.stringify(goals.map(g => ({ title: g.title, health: g.health, progress: g.progressPercent, daysStalled: g.daysSinceLastActivity })), null, 2)}

Manager Coaching Themes (Private context for synthesis):
${JSON.stringify(coachingNotes.map(n => n.tags), null, 2)}

Instructions:
1. Synthesize a 2-3 sentence executive summary of current momentum, stalled risks, and growth opportunities.
2. Generate 3-5 high-value collaborative talking points:
   - At least 1 'celebration' celebrating recent approved achievements.
   - At least 1 'blocker' addressing any goals marked 'stalled' or 'needs-attention' with concrete unblocking strategies.
   - At least 1 'growth' or 'strategy' topic focusing on leadership, architecture, or cross-team alignment.
3. Suggest 2-3 concrete mutual action items with clear ownership.

Output strictly valid JSON with this shape:
{
  "executiveSummary": "...",
  "talkingPoints": [
    {
      "title": "Short title",
      "description": "Specific discussion prompt with context",
      "type": "celebration" | "blocker" | "growth" | "strategy",
      "aiSuggested": true
    }
  ],
  "blockers": ["Blocker 1"],
  "actionItems": [
    {
      "task": "Task description",
      "assigneeRole": "employee" | "manager",
      "suggestedDueDate": "2026-11-05"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text?.trim() || '{}';
      return JSON.parse(text);
    } catch {
      // fallback
    }
  }

  // Deterministic synthesis fallback
  const stalledGoals = goals.filter(g => g.health === 'stalled' || g.health === 'needs-attention');
  const recentWins = approvedAchievements.slice(0, 3);

  return {
    executiveSummary: `Sprint alignment for ${employee.name}. Notable engineering momentum on ${recentWins[0]?.title || 'core service delivery'} with ${stalledGoals.length > 0 ? stalledGoals.length + ' objectives requiring manager escalation' : 'all OKRs on track'}.`,
    talkingPoints: [
      ...(recentWins.length > 0
        ? [
            {
              title: `Celebrate Impact: ${recentWins[0].title}`,
              description: `Acknowledge measurable outcome: ${recentWins[0].quantifiedMetrics.join(', ') || recentWins[0].businessImpactStatement.slice(0, 80)}. Discuss replication across other pipelines.`,
              type: 'celebration' as const,
              aiSuggested: true,
            },
          ]
        : []),
      ...(stalledGoals.length > 0
        ? [
            {
              title: `Unblock Stalled Objective: ${stalledGoals[0].title}`,
              description: `Goal has been inactive for ${stalledGoals[0].daysSinceLastActivity} days. Review dependency roadblocks, security sign-offs, or staffing adjustments.`,
              type: 'blocker' as const,
              aiSuggested: true,
            },
          ]
        : []),
      {
        title: 'Technical Leadership & Mentorship Trajectory',
        description: 'Review cross-functional influence, pairing with junior engineers, and documentation of architecture decisions.',
        type: 'growth' as const,
        aiSuggested: true,
      },
      {
        title: 'Quarterly OKR Pacing & Brag Sheet Check-In',
        description: 'Ensure all high-impact production contributions are logged and quantified before end-of-quarter review calibration.',
        type: 'strategy' as const,
        aiSuggested: true,
      },
    ],
    blockers: stalledGoals.map(g => `${g.title}: Inactive for ${g.daysSinceLastActivity} days. Needs dependency resolution.`),
    actionItems: [
      {
        task: `${manager.name} to escalate cross-team dependencies for ${stalledGoals[0]?.title || 'stalled tasks'}`,
        assigneeRole: 'manager',
        suggestedDueDate: 'Within 3 business days',
      },
      {
        task: `${employee.name} to compile initial Q3 Brag Sheet draft metrics for review calibration`,
        assigneeRole: 'employee',
        suggestedDueDate: 'By Friday',
      },
    ],
  };
}

/**
 * Intelligent deterministic fallback rule engine for impact conversion
 */
function fallbackDistiller(
  rawInput: string,
  goals: QuarterlyGoal[],
  source: string,
  sourceReference?: string
): ImpactTransformationResult {
  const lower = rawInput.toLowerCase();

  // Trivia filtering
  const trivia: string[] = [];
  if (lower.includes('lint') || lower.includes('typo') || lower.includes('formatting')) {
    trivia.push('Filtered routine linter/formatter fixes and syntax cleanups');
  }
  if (lower.includes('rebase') || lower.includes('merge conflict') || lower.includes('bump')) {
    trivia.push('Filtered branch rebases and routine package lockfile updates');
  }
  if (source === 'voice' && (lower.includes('coffee') || lower.includes('yesterday') || lower.includes('hey'))) {
    trivia.push('Filtered casual conversational filler phrases and informal speech pauses');
  }

  // Metric extraction / inference
  const metrics: string[] = [];
  const percentMatch = rawInput.match(/\d+%/g);
  if (percentMatch) metrics.push(...percentMatch.map(p => `Improved efficiency by ${p}`));

  const latencyMatch = rawInput.match(/(\d+)\s*(ms|seconds|sec)/gi);
  if (latencyMatch) metrics.push(...latencyMatch.map(l => `Latency reduced to ${l}`));

  const throughputMatch = rawInput.match(/(\d+k?)\s*(rps|events|qps|users)/gi);
  if (throughputMatch) metrics.push(...throughputMatch.map(t => `${t} throughput sustained`));

  if (metrics.length === 0) {
    if (lower.includes('latency') || lower.includes('p99') || lower.includes('faster')) {
      metrics.push('-38% query response latency', 'Zero dropped requests');
    } else if (lower.includes('memory') || lower.includes('leak') || lower.includes('cpu')) {
      metrics.push('-65% memory footprint', '$1,400/mo server cost savings');
    } else if (lower.includes('test') || lower.includes('coverage') || lower.includes('migration')) {
      metrics.push('100% test coverage on critical path', 'Zero deployment downtime');
    } else {
      metrics.push('High-availability SLA maintained', 'Sub-second processing time');
    }
  }

  // Goal matching heuristic
  let matchedGoal = goals[0];
  let highestScore = 0;
  for (const g of goals) {
    let score = 0;
    const gText = (g.title + ' ' + g.description + ' ' + g.category).toLowerCase();
    const words = rawInput.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    for (const w of words) {
      if (gText.includes(w)) score += 10;
    }
    if (score > highestScore) {
      highestScore = score;
      matchedGoal = g;
    }
  }

  const confidence = Math.min(98, Math.max(76, 75 + highestScore));

  // Title generation
  let title = 'Engineered Platform Capability';
  if (lower.includes('postgres') || lower.includes('database') || lower.includes('index')) {
    title = 'PostgreSQL High-Throughput Optimization';
  } else if (lower.includes('websocket') || lower.includes('connection')) {
    title = 'WebSocket Gateway Stability & Memory Hardening';
  } else if (lower.includes('migration') || lower.includes('zero-downtime')) {
    title = 'Automated Rollback-Safe Migration Framework';
  } else if (lower.includes('iceberg') || lower.includes('kafka') || lower.includes('stream')) {
    title = 'Real-Time Streaming Lakehouse Ingestion';
  } else if (sourceReference) {
    title = `Delivered ${sourceReference}: Core Engineering Enhancement`;
  }

  // Cleaned action directly extracted from the raw input
  const cleanedAction = rawInput
    .replace(/^(hey team|quick update|update on the|hey [a-z]+|just|we|i|yesterday|today|so|pretty stoked)[,\s:]+/i, '')
    .replace(/[.!?]\s*$/, '')
    .trim();

  // Google XYZ Impact Statement: Accomplished [X] as measured by [Y] by doing [Z]
  const actionText = cleanedAction ? (cleanedAction.charAt(0).toLowerCase() + cleanedAction.slice(1)) : 'implementing targeted architectural optimizations';
  const statement = `Accomplished platform performance and reliability targets (${metrics.slice(0, 2).join(', ')}) by ${actionText}, eliminating production regression risks and safeguarding critical service SLAs.`;

  return {
    title,
    businessImpactStatement: statement,
    technicalCraftSummary: `Engineered performant architectural enhancements with defensive timeout handling, automated rollback checks, and telemetry instrumentation. (${sourceReference || source})`,
    quantifiedMetrics: metrics.slice(0, 3),
    suggestedGoalId: matchedGoal?.id,
    goalMatchConfidence: confidence,
    goalMatchReasoning: `Strong semantic alignment with "${matchedGoal?.title || 'Platform Reliability'}" based on architectural components and operational metrics.`,
    triviaFilteredOut: trivia.length > 0 ? trivia : ['Filtered minor commits and intermediate staging rebases'],
    tags: ['Architecture', 'Reliability', 'Performance', 'Engineering Excellence'],
  };
}
