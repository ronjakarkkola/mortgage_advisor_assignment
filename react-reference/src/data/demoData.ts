import type { DocumentTypeMeta, CustomerProfile, DocumentState } from '@/types';

// ─── Document type definitions ─────────────────────────────────────────────────

export const DOCUMENT_TYPES: DocumentTypeMeta[] = [
  {
    id: 'salary_slips',
    label: 'Salary Slips',
    category: 'employment',
    weight: 20,
    required: true,
    appliesTo: 'employed',
    description: 'Last 3 months — showing gross and net pay.',
  },
  {
    id: 'employment_contract',
    label: 'Employment Contract',
    category: 'employment',
    weight: 20,
    required: true,
    appliesTo: 'employed',
    description: 'Current signed employment agreement.',
  },
  {
    id: 'annual_accounts',
    label: 'Annual Accounts',
    category: 'employment',
    weight: 10,
    required: true,
    appliesTo: 'self_employed',
    description: 'Last 2 years of business annual accounts.',
  },
  {
    id: 'tax_returns',
    label: 'Tax Returns',
    category: 'employment',
    weight: 10,
    required: true,
    appliesTo: 'self_employed',
    description: 'Last 2 years of personal tax assessments.',
  },
  {
    id: 'business_financials',
    label: 'Business Financial Statements',
    category: 'employment',
    weight: 20,
    required: true,
    appliesTo: 'self_employed',
    description: 'Recent profit & loss and balance sheet.',
  },
  {
    id: 'bank_statements',
    label: 'Bank Statements',
    category: 'financial',
    weight: 20,
    required: true,
    description: 'Last 3 months of your primary current account.',
  },
  {
    id: 'savings_statement',
    label: 'Savings Statement',
    category: 'financial',
    weight: 10,
    required: true,
    description: 'Most recent savings account balance.',
  },
  {
    id: 'student_debt',
    label: 'Student Debt Statement',
    category: 'debt',
    weight: 0,
    required: false,
    description: 'DUO student loan overview — if applicable.',
  },
  {
    id: 'personal_loans',
    label: 'Personal Loan Statement',
    category: 'debt',
    weight: 0,
    required: false,
    description: 'Overview of any outstanding personal loans.',
  },
  {
    id: 'identity_document',
    label: 'Passport or ID Card',
    category: 'identity',
    weight: 10,
    required: true,
    description: 'A valid, in-date passport or national ID card.',
  },
];

export const DOC_BY_ID: Record<string, DocumentTypeMeta> = Object.fromEntries(
  DOCUMENT_TYPES.map((d) => [d.id, d])
);

export const CATEGORY_META: Record<string, { name: string; icon: string }> = {
  employment: { name: 'Employment', icon: 'building' },
  financial: { name: 'Financial', icon: 'trend' },
  debt: { name: 'Debt', icon: 'file' },
  identity: { name: 'Identity', icon: 'shield' },
};

// ─── Document scenario messages (verbatim from spec) ──────────────────────────

export const SCENARIO_NOTES: Record<string, string> = {
  wrong: 'This document does not appear relevant for a mortgage application.',
  duplicate: 'This document appears to have already been uploaded.',
  outdated: 'This document appears older than the standard verification period.',
  incomplete: 'This document appears incomplete. Please upload the full document.',
  unreadable: 'The uploaded document could not be analyzed. Please try a clearer scan or photo.',
  unsupported: 'This file type is not supported. Please upload a PDF, JPG or PNG.',
  needs_review:
    'A discrepancy was detected between uploaded documents. Your advisor will need to review this.',
};

// ─── Extracted data templates per document ────────────────────────────────────

export function getExtractedData(
  docId: string,
  scenario: string,
  employerOverride?: string
): Record<string, string> {
  const employer = employerOverride || 'Tech Company BV';

  const templates: Record<string, Record<string, string>> = {
    salary_slips: {
      'Monthly Income': scenario === 'conflict' ? '€4,500' : '€4,250',
      Employer: employer,
      'Employment Type': 'Permanent Contract',
    },
    employment_contract: {
      'Monthly Income': scenario === 'conflict' ? '€3,200' : '€4,250',
      Employer: employer,
      'Employment Duration': '2 years 3 months',
    },
    bank_statements: {
      'Avg. Monthly Balance': '€6,300',
      'Statement Period': 'Last 3 months',
    },
    savings_statement: { 'Savings Balance': '€28,000' },
    student_debt: { 'Student Debt': '€7,500' },
    personal_loans: { 'Loan Balance': '€0' },
    identity_document: { 'Document Type': 'Passport', Status: 'Verified & In Date' },
    annual_accounts: { 'Avg. Annual Income': '€58,000', 'Business Health': 'Stable' },
    tax_returns: { 'Taxable Income': '€52,000' },
    business_financials: { 'Net Profit Margin': '18%', 'Business Status': 'Active' },
  };

  return templates[docId] ?? {};
}

// ─── Demo customer profile ─────────────────────────────────────────────────────

export const DEMO_PROFILE: CustomerProfile = {
  firstName: 'Dylan',
  lastName: 'Verhoeven',
  email: 'dylan.verhoeven@example.nl',
  phone: '+31 6 8765 4321',
  dob: '1993-04-15',
  employmentStatus: 'employed',
  employer: 'Tech Company BV',
  jobTitle: 'Software Engineer',
  employmentDuration: '2 years 3 months',
  targetPropertyValue: '350000',
  desiredMonthlyPayment: '1400',
  housingType: 'Apartment',
  city: 'Amsterdam',
  moveInTimeframe: '6–12 months',
};

export const EMPTY_DOC_STATE: DocumentState = {
  status: 'missing',
  fileName: null,
  fileSize: 0,
  extracted: {},
  note: null,
};

export const DEMO_DOCUMENTS: Record<string, DocumentState> = {
  salary_slips: {
    status: 'verified',
    fileName: 'salary_slip_may_2025.pdf',
    fileSize: 241000,
    extracted: {
      'Monthly Income': '€4,250',
      Employer: 'Tech Company BV',
      'Employment Type': 'Permanent Contract',
    },
    note: null,
    uploadedAt: new Date(Date.now() - 86400000 * 2),
  },
  employment_contract: {
    status: 'verified',
    fileName: 'employment_contract_2023.pdf',
    fileSize: 380000,
    extracted: {
      'Monthly Income': '€4,250',
      Employer: 'Tech Company BV',
      'Employment Duration': '2 years 3 months',
    },
    note: null,
    uploadedAt: new Date(Date.now() - 86400000 * 1),
  },
  bank_statements: {
    status: 'missing',
    fileName: null,
    fileSize: 0,
    extracted: {},
    note: null,
  },
  savings_statement: {
    status: 'missing',
    fileName: null,
    fileSize: 0,
    extracted: {},
    note: null,
  },
  identity_document: {
    status: 'missing',
    fileName: null,
    fileSize: 0,
    extracted: {},
    note: null,
  },
  student_debt: {
    status: 'missing',
    fileName: null,
    fileSize: 0,
    extracted: {},
    note: null,
  },
  personal_loans: {
    status: 'missing',
    fileName: null,
    fileSize: 0,
    extracted: {},
    note: null,
  },
  annual_accounts: { ...EMPTY_DOC_STATE },
  tax_returns: { ...EMPTY_DOC_STATE },
  business_financials: { ...EMPTY_DOC_STATE },
};

export const INITIAL_INSIGHTS = [
  {
    id: 'ins-demo-1',
    text: 'Salary slips successfully analyzed. Monthly income of €4,250 verified. Bank statements are still required to proceed.',
    timestamp: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'ins-demo-2',
    text: 'Employment contract verified. Permanent contract confirmed with Tech Company BV.',
    timestamp: new Date(Date.now() - 86400000),
  },
];

export const INITIAL_SUGGESTIONS = [
  "What's the difference between annuity and linear mortgages?",
  'What documents am I still missing?',
  'What does my readiness score mean?',
  'Can I afford a €350,000 home?',
];
