import type { KBEntry, CustomerProfile, DocumentState, Message } from '@/types';
import kbData from '@/data/knowledgeBase.json';
import { DOCUMENT_TYPES } from '@/data/demoData';
import {
  computeReadiness,
  getActiveDocIds,
  getMissingRequiredDocs,
  getIssueDocs,
  isDocVerified,
} from '@/utils/readiness';
import { formatMoney, STATUS_META } from '@/utils/formatting';

const KB: KBEntry[] = kbData as KBEntry[];

// ─── Knowledge base retrieval ──────────────────────────────────────────────────

export function searchKB(query: string, topK = 4): KBEntry[] {
  const q = query.toLowerCase();
  const words = q.split(/[^a-z0-9€]+/).filter((w) => w.length > 2);

  const scored = KB.map((entry) => {
    const haystack = `${entry.question} ${entry.answer} ${entry.tags.join(' ')}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (haystack.includes(w)) score += 1;
    }
    for (const tag of entry.tags) {
      if (q.includes(tag)) score += 2;
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const hits = scored.filter((s) => s.score > 0).slice(0, topK);
  if (hits.length === 0) return [KB[0], KB[KB.length - 1]];
  return hits.map((s) => s.entry);
}

// ─── Context block builder ────────────────────────────────────────────────────

export function buildContextBlock(
  profile: CustomerProfile,
  docs: Record<string, DocumentState>
): string {
  const status = profile.employmentStatus;
  const r = computeReadiness(profile, docs);
  const missing = getMissingRequiredDocs(docs, status);
  const issues = getIssueDocs(docs, status);
  const verified = getActiveDocIds(status).filter((id) => isDocVerified(docs, id));

  const lines: string[] = [
    'CUSTOMER PROFILE:',
    `- Name: ${profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Not provided'}`,
    `- Employment: ${status === 'self_employed' ? 'Self-employed' : 'Employed'}${profile.employer ? ` at ${profile.employer}` : ''}`,
    `- Target property value: ${formatMoney(profile.targetPropertyValue)}`,
    `- Desired monthly payment: ${formatMoney(profile.desiredMonthlyPayment)}`,
    `- Housing preference: ${profile.housingType || 'Not specified'}`,
    `- City: ${profile.city || 'Not specified'}`,
    '',
    'VERIFIED DOCUMENT DATA (extracted from uploads):',
  ];

  if (verified.length === 0) {
    lines.push('- No verified documents uploaded yet.');
  } else {
    for (const id of verified) {
      const extracted = docs[id].extracted;
      const label = DOCUMENT_TYPES.find((d) => d.id === id)?.label ?? id;
      const data = Object.entries(extracted)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      lines.push(`- ${label}: ${data || 'verified, no data extracted'}`);
    }
  }

  lines.push('');
  lines.push(`APPLICATION READINESS: ${r}%`);
  lines.push(
    `MISSING REQUIRED DOCUMENTS: ${missing.length ? missing.map((id) => DOCUMENT_TYPES.find((d) => d.id === id)?.label ?? id).join(', ') : 'None'}`
  );

  if (issues.length) {
    lines.push(
      `DOCUMENTS NEEDING ATTENTION: ${issues
        .map((id) => {
          const label = DOCUMENT_TYPES.find((d) => d.id === id)?.label ?? id;
          const statusLabel = STATUS_META[docs[id].status]?.label ?? docs[id].status;
          return `${label} (${statusLabel})`;
        })
        .join(', ')}`
    );
  }

  return lines.join('\n');
}

// ─── System prompt builder ────────────────────────────────────────────────────

export function buildSystemPrompt(
  profile: CustomerProfile,
  docs: Record<string, DocumentState>,
  query: string
): string {
  const kbMatches = searchKB(query, 4);
  const kbBlock = kbMatches.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join('\n\n');
  const contextBlock = buildContextBlock(profile, docs);

  return [
    'You are Silta, an AI mortgage assistant embedded in a Dutch mortgage origination platform. You act as a mortgage educator, application guide, and document assistant.',
    '',
    'You operate within a hybrid AI + human model: you handle education, guidance, document-readiness tracking, and application support. A human mortgage advisor always handles final review, validation, compliance, and any formal mortgage recommendation. Make this division clear whenever relevant.',
    '',
    'SAFETY RULES — follow strictly:',
    '- Never guarantee mortgage approval, claim affordability certainty, or say a customer is "qualified".',
    '- Never provide formal mortgage advice or replace the advisor.',
    '- For affordability, eligibility, or personalised recommendations, always use grounding language: "Based on the information currently available…", "This may indicate…", "A mortgage advisor will validate…", "This is guidance rather than formal mortgage advice…".',
    '- Reference the customer\'s actual uploaded information when available; be explicit when information is missing.',
    '- If no relevant documents exist for an affordability question, say you don\'t have enough information yet.',
    '- If the customer expresses anxiety about approval, be reassuring and factual — many applications require additional review and this is normal.',
    '- Keep responses concise (2–5 sentences) unless the question genuinely requires more depth.',
    '- Write in plain conversational prose — no markdown headers, asterisks, or bullet characters.',
    '',
    'RELEVANT KNOWLEDGE BASE (paraphrase naturally — do not repeat verbatim):',
    kbBlock,
    '',
    contextBlock,
  ].join('\n');
}

// ─── Suggestion pool ───────────────────────────────────────────────────────────

const SUGGESTION_POOL: Record<string, string[]> = {
  basics: [
    "What is NHG and how does it benefit me?",
    "What does loan-to-value mean?",
    "What's the difference between gross and net mortgage cost?",
  ],
  products: [
    "What's the difference between annuity and linear mortgages?",
    "What is a fixed interest rate period?",
    "Can I combine different mortgage types?",
  ],
  process: [
    "What happens during advisor review?",
    "How long does the mortgage process usually take?",
    "What does the AI review actually check?",
  ],
  documents: [
    "What documents am I still missing?",
    "How recent do my bank statements need to be?",
    "What documents do self-employed applicants need?",
  ],
  affordability: [
    "Can I afford my target property?",
    "How does existing debt affect affordability?",
    "What should I do next to improve my readiness score?",
  ],
  platform: [
    "What does my readiness score mean?",
    "Can the AI approve my mortgage?",
    "When should I contact my advisor?",
  ],
};

export function getSuggestions(lastQuery: string): string[] {
  const matches = searchKB(lastQuery, 2);
  const cats = [...new Set(matches.map((m) => m.category))];
  let pool: string[] = [];
  for (const cat of cats) {
    if (SUGGESTION_POOL[cat]) pool.push(...SUGGESTION_POOL[cat]);
  }
  if (pool.length < 3) {
    for (const arr of Object.values(SUGGESTION_POOL)) pool.push(...arr);
  }
  const q = lastQuery.toLowerCase();
  return [...new Set(pool.filter((p) => p.toLowerCase() !== q))].slice(0, 4);
}

// ─── Advisor trigger detection ────────────────────────────────────────────────

const ADVISOR_TRIGGER_RE =
  /\b(recommend|best for me|final decision|guarantee|approve|approved|qualified|qualify|sure i will|will i get)\b/i;

export function shouldSuggestAdvisor(query: string): boolean {
  return ADVISOR_TRIGGER_RE.test(query);
}

// ─── OpenAI call ───────────────────────────────────────────────────────────────

export async function callOpenAI(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  model = 'gpt-4o-mini'
): Promise<string> {
  const history = messages
    .slice(-10)
    .filter((m) => !m.proactive)
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      temperature: 0.5,
      messages: [{ role: 'system', content: systemPrompt }, ...history],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? 'No response received.';
}

// ─── Anthropic/Claude fallback ────────────────────────────────────────────────

export async function callClaude(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const history = messages
    .slice(-10)
    .filter((m) => !m.proactive)
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: history,
    }),
  });

  if (!response.ok) throw new Error(`Claude API error ${response.status}`);

  const data = await response.json() as {
    content?: Array<{ type: string; text?: string }>;
  };
  return (
    data.content
      ?.filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')
      .trim() ?? 'No response.'
  );
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function askSilta(
  userMessage: string,
  conversationHistory: Message[],
  profile: CustomerProfile,
  docs: Record<string, DocumentState>,
  openAIKey: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(profile, docs, userMessage);
  const historyWithUser: Message[] = [
    ...conversationHistory,
    {
      id: 'tmp',
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    },
  ];

  // Try OpenAI if key provided
  if (openAIKey?.trim().startsWith('sk-')) {
    try {
      return await callOpenAI(
        historyWithUser,
        systemPrompt,
        openAIKey,
        import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini'
      );
    } catch (err) {
      console.warn('OpenAI call failed, trying Claude fallback:', err);
    }
  }

  // Try Claude (works within claude.ai artifacts)
  try {
    return await callClaude(historyWithUser, systemPrompt);
  } catch (err) {
    console.warn('Claude call failed:', err);
    throw new Error('AI assistant unavailable. Please check your API key in Settings or try again.');
  }
}
