 Silta

### AI agent

This project was built using Claude as the primary AI coding agent.

### Anthropic API

Ideally, this project should be used with an API key, as this allows the AI assistant to answer a much wider range of questions. Without an API key, its responses are limited. At the moment, the AI chat can answer questions about uploaded documents and some general mortgage-related questions. In a real-world application, it would be further developed so that it can answer a wider range of customer questions. We tried the AI chat with a connection to Anthropic API and without one as well, 
but of course, the one with a connection is able to respond better.

### Agent Instructions

## Project Overview

Silta is an AI-assisted mortgage origination platform built as a university MVP.

The goal is to demonstrate how AI can improve the mortgage customer journey through:

- Intelligent document uploads
- Personalized mortgage guidance
- Conversational AI
- Application readiness tracking
- Human advisor collaboration

This is a customer facing app only.

# Project Structure

The primary deliverable is one app called Silta, but it only shows the customer side. The customer side also requires mock data.

# Application Pages

**Dashboard**

Provides an overview of the mortgage application, readiness score, uploaded documents, missing documents, AI insights and recommended next steps.

**Document Center**

Allows customers to upload mortgage documents, review verification status and view extracted financial information.

**AI Assistant**

The primary feature of the application. Provides mortgage guidance, answers customer questions and personalizes responses using uploaded documents.

**Profile**

Contains personal information, employment information and mortgage preferences used to personalize AI responses.


# Core Features

**Dashboard**

Display:

- Mortgage Readiness Score
- Progress Tracker
- Uploaded Documents
- Missing Documents
- AI Insights
- Recommended Next Steps

**Document Upload**

Allow customers to upload:

- Salary Slips
- Employment Contract
- Bank Statements
- Savings Statement
- Identity Documents
- Debt Documents

After upload, simulate document analysis by extracting:

- Monthly Income
- Employer
- Employment Type
- Savings
- Student Debt
- Other Liabilities

Each document should receive one of the following statuses:

- Verified
- Missing
- Outdated
- Duplicate
- Incomplete
- Needs Review
- Unreadable


**AI Mortgage Assistant**

The AI should:

- Explain mortgage concepts
- Answer customer questions
- Reference uploaded documents
- Explain missing documents
- Track application progress
- Guide the customer through the mortgage journey

The AI should remember previous messages during the session.

# Mortgage Readiness

Calculate a readiness score between 0-100%

The score should increase as customers:

- Complete their profile
- Upload required documents
- Resolve document issues

The score should always be recalculated from the current application state.

# AI Context

Every AI response should consider:

- Mortgage knowledge base
- Uploaded documents
- Customer profile
- Readiness score
- Missing documents
- Previous conversation history

Responses should feel personalized rather than generic.

# AI Safety

The AI must not:

- Guarantee mortgage approval
- Provide regulated mortgage advice
- Replace a mortgage advisor

Instead use phrases such as:

> "Based on the information currently available..."

> "This may indicate..."

> "A mortgage advisor will validate this before any final recommendation."

---

# Development Principles

**Focus on UX**

The application should feel polished, intuitive and trustworthy.

**Prioritize readability**

Write clean, maintainable code that is easy to understand.

**AI First**

The AI assistant should feel like the central feature of the platform, not an afterthought.

**Document Intelligence**

Uploaded documents should directly influence AI responses and the readiness score.

**Customer Guidance**

The customer should always know:

- Where they are in the process
- What documents are missing
- What they should do next

## Features

### Mortgage Dashboard
- **Readiness Score** (0–100%) — live-calculated from profile completeness + verified documents
- **Application Progress** — 6-step tracker from start to final offer
- **Your Next Steps** — dynamic action panel that auto-updates after every upload, verification, or profile change
- **Document Overview** — verified/missing/issue counts at a glance
- **AI Insights Feed** — proactive messages from Silta after each document event
- **Advisor Card** — direct access to your assigned mortgage advisor

###  Document Center
- Upload support for all required Dutch mortgage documents
- **AI analysis simulation** with realistic extracted data (income, employer, savings, debt)
- Document statuses: Verified · Missing · Outdated · Duplicate · Incomplete · Unreadable · Needs Review · Wrong document · Unsupported format
- **Edge case detection**: wrong document type (rental agreements, utility bills, etc.), conflicting income figures between salary slip and employment contract
- Self-employed document flow (annual accounts, tax returns, business financials)
- Demo scenario selector for every document slot

### AI Mortgage Assistant 
- Every response grounded in: customer profile + verified document data + readiness score + missing docs
- Full conversation memory (session), timestamps, typing indicator
- Suggested follow-up chips that update based on conversation topic
- Copy message button, New conversation, Clear chat
- Context panel: live view of what the AI knows about you
- Always requires advisor approval
- "Send this to my advisor" trigger on advice-seeking questions

### Profile
- Personal, employment and mortgage goals
- Employed / Self-employed toggle → dynamically changes required document list
- Saves to state → immediately re-scores readiness

### Advisor Contact
- Send message · Request callback · Ask for human assistance
- Simulated send/receive flow with status updates
- Advisor modal accessible from every page


## Installation

## Running Locally

### Quick start
1. Open `silta.html` in your browser
2. The app loads with no demo data filled yet

