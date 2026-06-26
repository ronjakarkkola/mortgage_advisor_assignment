// ─── Currency ──────────────────────────────────────────────────────────────────

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (isNaN(n)) return String(value);
  return '€' + n.toLocaleString('en-US');
}

// ─── Time ──────────────────────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── File size ─────────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Status display ────────────────────────────────────────────────────────────

export const STATUS_META: Record<string, { label: string; variant: string }> = {
  missing: { label: 'Missing', variant: 'neutral' },
  analyzing: { label: 'Analyzing…', variant: 'info' },
  verified: { label: 'Verified', variant: 'success' },
  outdated: { label: 'Outdated', variant: 'warn' },
  duplicate: { label: 'Duplicate', variant: 'warn' },
  incomplete: { label: 'Incomplete', variant: 'warn' },
  unreadable: { label: 'Unreadable', variant: 'danger' },
  needs_review: { label: 'Needs Review', variant: 'warn' },
  wrong: { label: 'Not Relevant', variant: 'danger' },
  unsupported: { label: 'Unsupported Format', variant: 'danger' },
};

// ─── Unique ID ─────────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Class name helper ─────────────────────────────────────────────────────────

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Application status colour ────────────────────────────────────────────────

export function statusVariant(status: string): string {
  const map: Record<string, string> = {
    'Not Started': 'neutral',
    'Getting Started': 'warn',
    'In Progress': 'info',
    'Ready for Advisor Review': 'success',
    'In Advisor Review': 'info',
  };
  return map[status] ?? 'neutral';
}

// ─── Readiness ring colour ────────────────────────────────────────────────────

export function readinessColor(pct: number): string {
  if (pct >= 80) return '#3FA876';
  if (pct >= 50) return '#4A7CA8';
  return '#B9762A';
}
