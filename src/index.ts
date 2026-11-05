// DelendAI integration — development profiles, proposal guardian, optimizer
export * as hephaistos from "./hephaistos";
export type {
  DelendAIDevProfile,
  ProposalGuard,
  GuardianVerdict,
  Candidate,
  RankResult,
  BudgetPool,
} from "./hephaistos";

// Ergane workflow re-exports — the workflow generator imports these from
// `.../ergane/src` (see the generated workflow.tsx: `import { SuperRalph } from
// "ergane/src"`, `import { ralphOutputSchemas } from "ergane/src"`). They were
// dropped when this barrel was reduced to hephaistos-only, which made every
// generated workflow fail at load (`SuperRalph not found`).
export { ralphOutputSchemas } from "./schemas";
export { SuperRalph } from "./components/SuperRalph";
export type { SuperRalphProps } from "./components/SuperRalph";
