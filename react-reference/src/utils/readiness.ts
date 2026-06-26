import type {
  CustomerProfile,
  DocumentState,
  EmploymentStatus,
  ProgressStep,
  NextStep,
} from '@/types';
import { DOCUMENT_TYPES } from '@/data/demoData';

// ─── Document filtering ────────────────────────────────────────────────────────

export function getEmploymentDocIds(status: EmploymentStatus): string[] {
  return status === 'self_employed'
    ? ['annual_accounts', 'tax_returns', 'business_financials']
    : ['salary_slips', 'employment_contract'];
}

export function getActiveDocIds(status: EmploymentStatus): string[] {
  const empIds = getEmploymentDocIds(status);
  return DOCUMENT_TYPES.filter(
    (d) => d.category !== 'employment' || empIds.includes(d.id)
  ).map((d) => d.id);
}

export function getRequiredDocIds(status: EmploymentStatus): string[] {
  return getActiveDocIds(status).filter(
    (id) => DOCUMENT_TYPES.find((d) => d.id === id)?.required
  );
}

export function isDocVerified(docs: Record<string, DocumentState>, id: string): boolean {
  return docs[id]?.status === 'verified';
}

const ISSUE_STATUSES = new Set([
  'outdated', 'duplicate', 'incomplete', 'unreadable', 'needs_review', 'wrong', 'unsupported',
]);

export function hasAnyIssue(
  docs: Record<string, DocumentState>,
  status: EmploymentStatus
): boolean {
  return getActiveDocIds(status).some((id) => ISSUE_STATUSES.has(docs[id]?.status ?? ''));
}

export function getIssueDocs(
  docs: Record<string, DocumentState>,
  status: EmploymentStatus
): string[] {
  return getActiveDocIds(status).filter((id) => ISSUE_STATUSES.has(docs[id]?.status ?? ''));
}

export function getMissingRequiredDocs(
  docs: Record<string, DocumentState>,
  status: EmploymentStatus
): string[] {
  return getRequiredDocIds(status).filter((id) => docs[id]?.status === 'missing');
}

// ─── Profile completeness ──────────────────────────────────────────────────────

export function isProfileComplete(profile: CustomerProfile): boolean {
  const baseOk = Boolean(
    profile.firstName &&
      profile.lastName &&
      profile.email &&
      profile.phone &&
      profile.targetPropertyValue &&
      profile.desiredMonthlyPayment &&
      profile.housingType
  );
  const empOk =
    profile.employmentStatus === 'self_employed' ? true : Boolean(profile.employer);
  return baseOk && empOk;
}

// ─── Readiness score ───────────────────────────────────────────────────────────

export function computeReadiness(
  profile: CustomerProfile,
  docs: Record<string, DocumentState>
): number {
  let score = 0;
  const status = profile.employmentStatus;

  if (isProfileComplete(profile)) score += 10;

  if (status === 'self_employed') {
    if (isDocVerified(docs, 'annual_accounts') && isDocVerified(docs, 'tax_returns'))
      score += 10;
    if (isDocVerified(docs, 'business_financials')) score += 20;
  } else {
    if (isDocVerified(docs, 'salary_slips')) score += 20;
    if (isDocVerified(docs, 'employment_contract')) score += 20;
  }

  if (isDocVerified(docs, 'bank_statements')) score += 20;
  if (isDocVerified(docs, 'savings_statement')) score += 10;
  if (isDocVerified(docs, 'identity_document')) score += 10;

  // No-issues bonus only applies once at least one required doc is uploaded
  const anyUploaded = getRequiredDocIds(status).some(
    (id) => docs[id]?.status !== 'missing'
  );
  if (anyUploaded && !hasAnyIssue(docs, status)) score += 10;

  return Math.min(100, score);
}

// ─── Application status label ─────────────────────────────────────────────────

export function getApplicationStatus(
  profile: CustomerProfile,
  docs: Record<string, DocumentState>,
  advisorReviewRequested: boolean
): string {
  if (advisorReviewRequested) return 'In Advisor Review';
  const r = computeReadiness(profile, docs);
  const missing = getMissingRequiredDocs(docs, profile.employmentStatus);
  if (r >= 90 && missing.length === 0 && !hasAnyIssue(docs, profile.employmentStatus))
    return 'Ready for Advisor Review';
  if (r >= 50) return 'In Progress';
  if (r > 0) return 'Getting Started';
  return 'Not Started';
}

// ─── Progress steps ────────────────────────────────────────────────────────────

export function getProgressSteps(
  profile: CustomerProfile,
  docs: Record<string, DocumentState>,
  advisorReviewRequested: boolean
): ProgressStep[] {
  const status = profile.employmentStatus;
  const req = getRequiredDocIds(status);
  const anyAnalyzing = req.some((id) => docs[id]?.status === 'analyzing');
  const allUploaded = req.every((id) => docs[id]?.status !== 'missing');
  const r = computeReadiness(profile, docs);

  const steps: ProgressStep[] = [
    { title: 'Application Started', done: true },
    { title: 'Documents Uploaded', done: allUploaded },
    { title: 'AI Review Complete', done: allUploaded && !anyAnalyzing },
    {
      title: 'Ready For Advisor Review',
      done:
        r >= 90 &&
        getMissingRequiredDocs(docs, status).length === 0 &&
        !hasAnyIssue(docs, status),
    },
    { title: 'Advisor Review', done: advisorReviewRequested },
    { title: 'Final Offer', done: false },
  ];

  let currentSet = false;
  for (const step of steps) {
    if (!step.done && !currentSet) {
      step.current = true;
      currentSet = true;
    }
  }

  return steps;
}

// ─── Next steps ────────────────────────────────────────────────────────────────

export function getNextSteps(
  profile: CustomerProfile,
  docs: Record<string, DocumentState>,
  advisorReviewRequested: boolean
): NextStep[] {
  const items: NextStep[] = [];
  const status = profile.employmentStatus;

  if (!isProfileComplete(profile)) {
    items.push({
      text: 'Complete your profile information',
      sub: 'Helps Silta personalise guidance and confirm affordability basics.',
      action: 'profile',
      actionLabel: 'Go to profile',
    });
  }

  getMissingRequiredDocs(docs, status)
    .slice(0, 3)
    .forEach((id) => {
      const meta = DOCUMENT_TYPES.find((d) => d.id === id);
      if (meta) {
        items.push({
          text: `Upload ${meta.label}`,
          sub: meta.description,
          action: 'documents',
          actionLabel: 'Upload',
        });
      }
    });

  getIssueDocs(docs, status)
    .slice(0, 2)
    .forEach((id) => {
      const meta = DOCUMENT_TYPES.find((d) => d.id === id);
      if (meta) {
        items.push({
          text: `Resolve issue with ${meta.label}`,
          sub: `Status: ${docs[id].status.replace('_', ' ')} — review and re-upload.`,
          action: 'documents',
          actionLabel: 'Review',
        });
      }
    });

  const r = computeReadiness(profile, docs);
  if (items.length === 0 && r >= 90 && !advisorReviewRequested) {
    items.push({
      text: 'Request advisor review',
      sub: 'Your application looks complete and ready for human review.',
      action: 'advisor-review',
      actionLabel: 'Request',
    });
  }

  if (items.length < 3) {
    items.push({
      text: 'Ask Silta about mortgage options',
      sub: 'Get personalised guidance based on your profile and documents.',
      action: 'assistant',
      actionLabel: 'Ask Silta',
    });
  }

  items.push({
    text: 'Contact your mortgage advisor',
    sub: 'Send a message or request a callback any time.',
    action: 'advisor-modal',
    actionLabel: 'Contact',
  });

  return items.slice(0, 5);
}

// ─── Readiness hint text ───────────────────────────────────────────────────────

export function getReadinessHint(score: number): string {
  if (score >= 90) return 'Your application looks ready for advisor review.';
  if (score >= 70) return 'Uploading remaining documents will prepare your application for advisor review.';
  if (score >= 40) return 'A few more documents will meaningfully move your application forward.';
  return 'Uploading income and identity documents is the fastest way to make progress.';
}

// ─── Income conflict check ────────────────────────────────────────────────────

export function detectIncomeConflict(docs: Record<string, DocumentState>): boolean {
  const slipIncome = docs['salary_slips']?.extracted?.['Monthly Income'];
  const contractIncome = docs['employment_contract']?.extracted?.['Monthly Income'];
  if (!slipIncome || !contractIncome) return false;
  const a = parseInt(slipIncome.replace(/[^\d]/g, ''));
  const b = parseInt(contractIncome.replace(/[^\d]/g, ''));
  return !isNaN(a) && !isNaN(b) && Math.abs(a - b) >= 500;
}
