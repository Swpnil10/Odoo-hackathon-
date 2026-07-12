# 🌱 EcoSphere — Corporate ESG Gamification Platform

> A fully interactive, gamified ESG (Environmental, Social, Governance) dashboard built for the Odoo Hackathon. EcoSphere empowers employees and ESG administrators to track, verify, and celebrate sustainable corporate actions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Application Pages](#application-pages)
- [Core Concepts](#core-concepts)
- [Data Architecture](#data-architecture)
- [Utility Functions](#utility-functions)
- [Backend Integration Guide](#backend-integration-guide)
- [Scripts](#scripts)

---

## Overview

**EcoSphere** is a dark-themed, glassmorphic single-page application (SPA) that gamifies corporate sustainability efforts. Employees earn **XP** and **Points** by completing ESG challenges; an interactive SVG **Living Terrarium** evolves as the user progresses. ESG Admins can create new challenges, audit employee submissions, and manage reward inventory — all from a unified console.

The platform covers all three ESG pillars:

| Pillar | Color | Example Actions |
|---|---|---|
| 🌱 **Environmental** | Emerald | Zero Waste Week, Commute Green, Digital Declutter |
| 💜 **Social** | Violet | D&I Sessions, Food Bank Volunteering |
| ⚖️ **Governance** | Amber | Ethics Training, Whistleblower Policy Audit |

---

## Features

### 🏠 Dashboard (Employee View)
- **Glassmorphic Welcome Card** — Personalized greeting with weekly stats (challenges completed, CO2 offset).
- **Living ESG Terrarium** — An animated SVG ecosystem that evolves across 4 stages based on accumulated XP:
  - **Stage 1 (0–100 XP):** Seedling Dome
  - **Stage 2 (101–300 XP):** Flourishing Sapling
  - **Stage 3 (301–600 XP):** Solar Oasis
  - **Stage 4 (601+ XP):** Carbon-Neutral Haven
  - Each prop (soil, sapling, solar panels, wind turbine, butterflies) is **clickable** and reveals ESG metadata, impact notes, and unlock conditions.
- **Active Corporate Challenges Panel** — Filterable list of challenges with status-driven action buttons (Join → Submit Proof → Completed / Rejected).

### 📊 ESG Audit Scorecards
- **Company ESG Rating Dial** — Animated circular SVG gauge showing a company-wide weighted score.
- **Configurable Weight Sliders** — Lock/unlock Environmental, Social, and Governance weight sliders with real-time proportional balancing (always sums to 100%).
- **Department Breakdown Bar Chart** — Recharts grouped bar chart comparing E/S/G raw scores and the computed weighted total.
- **E/S/G Compliance Radar Chart** — Multi-department radar overlay chart visualizing relative pillar strengths.
- **Carbon Offset Projection Chart** — 4-quarter forecasting area chart (Baseline, Projected, Optimistic) driven dynamically by the live ESG index.
- **Score Summary Table** — Tabular view with per-department E, S, G, Employee Count, and Weighted Index columns.

### 🎁 Rewards & Recognition
- **Earned Badges Panel** — Grid of auto-unlocked achievement badges based on XP thresholds or challenge completion counts (e.g., "Green Seedling", "Eco Warrior").
- **Perks & Vouchers Shop** — Redeem points for Physical gear, Digital offsets, or Experience perks (e.g., bike share pass, solar charger, mentorship lunch).
- **Live Point Balance** — Displayed prominently; deducted upon redemption with animated success modal.
- **Stock Awareness** — Low-stock items pulse; out-of-stock items are correctly gated.

### 📄 Custom Report Builder
- **ESG Query Builder** — Multi-field filter panel (Department, ESG Pillar, Module, Employee, Date Range, Challenge Title Search).
- **Summary Statistics** — Total CO2 offsets logged, audit log entry count, and Environmental Focus Ratio.
- **Audit Trend Area Chart** — Carbon offset aggregation over time (from filtered audit logs).
- **Compliance Verification Ledger** — Full tabular audit log with Log ID, Timestamp, Employee, Department, Module, ESG Pillar, Verified Task, and Offset Savings.
- **Export Buttons** — CSV and PDF export simulation with loading shimmer and success feedback state.

### 🔧 Admin Console (ESG Admin Only)
Accessible after toggling role from `Employee → Admin` via the sidebar.

- **Challenge Creator** — Form to configure and publish new ESG challenges (title, description, category, XP, points, proof requirement, start/end dates). Supports saving as Draft or publishing as Active.
- **Audit Verification Ledger** — Lists all challenges in "Under Review" status. Admins can **Approve** (grants XP + points to the user) or **Reject** (with a required written rejection note). Approved entries animate out.
- **Reward Inventory Manager** — Grid view of all rewards with live stock edits. Inline number input + Update button pushes new stock values to shared app state.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **TypeScript** | ~6.x | Type safety |
| **Vite** | 8.x | Dev server & build tool |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.x | Animations & transitions |
| **Recharts** | 3.x | Data visualization charts |
| **Lucide React** | 1.x | Icon library |
| **Vitest** | 4.x | Unit testing framework |
| **Oxlint** | 1.x | Fast JS/TS linter |
| **PostCSS + Autoprefixer** | — | CSS processing |

---

## Project Structure

```
OdooHackathon/
├── public/                        # Static assets
├── src/
│   ├── components/
│   │   ├── AdminConsole.tsx        # ESG Admin Console (Challenge Creator, Audit, Inventory)
│   │   ├── ChallengeList.tsx       # Employee challenge cards with status actions
│   │   ├── GlassCard.tsx           # Reusable glassmorphic card wrapper
│   │   ├── ReportBuilder.tsx       # Custom ESG query builder & audit visualizations
│   │   ├── RewardStore.tsx         # Badges gallery + rewards redemption shop
│   │   ├── ScoreWeights.tsx        # ESG score dashboard with charts & weight sliders
│   │   ├── Sidebar.tsx             # Navigation sidebar with user profile
│   │   └── Terrarium.tsx           # Interactive animated SVG ecosystem
│   ├── data/
│   │   └── mockData.ts             # All static seed data (user, challenges, rewards, badges)
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces & type aliases
│   ├── utils/
│   │   ├── badgeUnlocker.ts        # Badge evaluation logic (XP & challenge count rules)
│   │   └── esgMath.ts              # Weighted ESG score calculations
│   ├── App.tsx                     # Root component — shared state, routing, action handlers
│   ├── App.css                     # App-level CSS overrides
│   ├── index.css                   # Global Tailwind + custom CSS design tokens
│   └── main.tsx                    # React DOM entry point
├── index.html                      # Vite HTML template
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── .oxlintrc.json                  # Linting configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd OdooHackathon

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building for Production

```bash
npm run build
```

Output is placed in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Application Pages

| Tab Key | Page Title | Role |
|---|---|---|
| `dashboard` | Sustainability Ecosystem | Employee |
| `scores` | ESG Audit Scorecards | Employee |
| `rewards` | Rewards & Recognition | Employee |
| `reports` | Custom Report Builder | Employee |
| `admin` | ESG Corporate Management | **Admin only** |

The **role toggle** in the sidebar switches between `employee` and `admin`. Switching back from admin automatically redirects to the dashboard.

---

## Core Concepts

### XP & Level System

- Users start with XP, Level, and a Point balance (see `initialUser` in `mockData.ts`).
- Each level requires `level × 200` XP to complete.
- XP is earned by completing challenges; the system handles **multi-level-ups** in a single action.
- Level and XP drive the **Terrarium stage** and **badge unlock** evaluations.

```
Level Thresholds:
  Level 1 → 200 XP to advance
  Level 2 → 400 XP to advance
  Level N → N × 200 XP to advance
```

### Challenge Lifecycle

```
Draft → Active → Under Review → Completed
                              ↘ Active (Rejected with note)
                              ↘ Archived
```

| Status | Description |
|---|---|
| `Draft` | Created by admin, not yet visible to employees |
| `Active` | Live and joinable by employees |
| `Under Review` | Employee has submitted proof; pending admin approval |
| `Completed` | Admin approved; XP and Points awarded |
| `Archived` | Closed challenge, no longer actionable |

### Badge Unlock Rules

Badges are evaluated automatically via a `useEffect` in `App.tsx` every time XP, Level, or challenge state changes.

| Rule Type | Logic |
|---|---|
| `XP` | Unlock if cumulative XP ≥ threshold value |
| `ChallengeCount` | Unlock if completed challenge count (optionally filtered by category) ≥ value |

Cumulative XP accounts for all previous levels (e.g., a Level 3 user at 320 XP has `320 + 200 + 400 = 920` cumulative XP).

### ESG Weight Calculation

The `ScoreWeights` component uses **proportional balancing** — when one slider is moved, the other two sliders adjust proportionally so the total always equals 100%.

```
Weighted Score = (E × w_env + S × w_soc + G × w_gov) / 100
Company Score  = Average of all department weighted scores
              OR weighted average by employee count (toggle)
```

---

## Data Architecture

All data is currently sourced from `src/data/mockData.ts`. The following entities are defined:

### `UserProfile`
```ts
{
  name: string;
  role: string;
  department: string;
  xp: number;
  points: number;
  level: number;
  badges: string[]; // Badge IDs
}
```

### `Challenge`
```ts
{
  id: string;
  title: string;
  description: string;
  category: 'Environmental' | 'Social' | 'Governance';
  xp: number;
  points: number;
  status: 'Draft' | 'Active' | 'Under Review' | 'Completed' | 'Archived';
  proofRequired: boolean;
  proofSubmitted?: string;
  rejectionNote?: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
}
```

### `Reward`
```ts
{
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  stock: number;
  category: 'Physical' | 'Digital' | 'Experience';
  icon: string; // Lucide icon name
}
```

### `Badge`
```ts
{
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockRule: {
    type: 'XP' | 'ChallengeCount';
    value: number;
    category?: ESGCategory;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
}
```

### `DepartmentScore`
```ts
{
  id: string;
  name: string;
  environmental: number; // 0-100
  social: number;        // 0-100
  governance: number;    // 0-100
  employeeCount: number;
}
```

---

## Utility Functions

### `src/utils/esgMath.ts`

| Function | Description |
|---|---|
| `calculateWeightedScores(departments, weights)` | Returns each department augmented with a `weightedTotal` score |
| `calculateOverallESGScore(calculatedDepts, weightByEmployees)` | Returns company-wide ESG index (simple or employee-weighted average) |

### `src/utils/badgeUnlocker.ts`

| Function | Description |
|---|---|
| `calculateCumulativeXp(xp, level)` | Converts level + current XP into a single cumulative XP number |
| `checkBadgeUnlock(badge, cumulativeXp, challenges)` | Evaluates a single badge's unlock condition |
| `evaluateBadgeUnlocks(badges, xp, level, challenges)` | Evaluates all badges; returns updated list + a flag if any were newly unlocked |

---

## Backend Integration Guide

> The mock data layer in `src/data/mockData.ts` is designed to be easily replaceable with real API calls.

```ts
// BEFORE (mock):
import { mockChallenges } from './data/mockData';

// AFTER (real API):
const challenges = await fetch('/api/challenges').then(r => r.json());
```

**Key integration points:**

1. **`src/data/mockData.ts`** — Replace static exports with `async` API fetch functions.
2. **`App.tsx` state** — Wrap `useState` initializations with `useEffect` + fetch calls to hydrate from the backend.
3. **Action handlers** (`handleEarnRewards`, `handleUpdateChallengeStatus`, `handleRedeemReward`) — Add `fetch`/`axios` calls alongside the local state updates to persist to the backend.
4. **TypeScript types** — Keep the interfaces in `src/types/index.ts` in sync with your API response schemas to avoid runtime errors.
5. **State management** — For production scale, consider replacing local `useState` with Zustand or React Query for server-state synchronization.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server (HMR enabled) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint static analysis |
| `npm run test` | Run Vitest unit test suite |

---

## Design System

- **Background:** `#05070f` (near-black, deep navy)
- **Glass panels:** `rgba(255,255,255,0.03–0.05)` with blurred borders
- **ESG Color Palette:**
  - Environmental → `emerald-400` (#10b981)
  - Social → `violet-400` (#8b5cf6)
  - Governance → `amber-400` (#f59e0b)
- **Animations:** Framer Motion page transitions, `AnimatePresence` for list items, SVG `animate-sway`, `animate-float`, `animate-spin-slow`, `animate-pulse-slow`
- **Typography:** System sans-serif with tight tracking on labels, extrabold headings

---

## License

Built for the **Odoo Hackathon 2026**. All rights reserved.
