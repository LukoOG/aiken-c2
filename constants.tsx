
import React from 'react';
import { HistoryItem } from './types';

export const DEFAULT_TS_CODE = `// Example: Simple Vesting Validator
interface Datum {
  beneficiary: string;
  deadline: number;
}

function validate(datum: Datum, redeemer: void, context: any): boolean {
  const isCorrectBeneficiary = context.signatories.includes(datum.beneficiary);
  const isPastDeadline = context.range.lowerBound >= datum.deadline;
  
  return isCorrectBeneficiary && isPastDeadline;
}`;

export const DEFAULT_PY_CODE = `# Example: Simple Vesting Validator
from dataclasses import dataclass

@dataclass
class Datum:
    beneficiary: str
    deadline: int

def validate(datum: Datum, redeemer: None, context: any) -> bool:
    is_correct_beneficiary = datum.beneficiary in context.signatories
    is_past_deadline = context.range.lower_bound >= datum.deadline
    
    return is_correct_beneficiary and is_past_deadline`;

export const TEMPLATES = {
  typescript: {
    basic: `// Basic Logic Boilerplate
function main(datum: any, redeemer: any, ctx: any): boolean {
  return true;
}`,
    vesting: `// Vesting Contract
interface VestingDatum {
  owner: string;
  lock_until: number;
}

function validate(datum: VestingDatum, _r: void, ctx: any) {
  return ctx.signatories.includes(datum.owner) && ctx.time >= datum.lock_until;
}`,
    oracle: `// Oracle Consumption Logic
interface OracleDatum {
  price: number;
  expiry: number;
}

function consume_oracle(datum: OracleDatum, _r: void, ctx: any) {
  return datum.price > 0 && ctx.time < datum.expiry;
}`
  },
  python: {
    basic: `# Basic Logic Boilerplate
def validate(datum: any, redeemer: any, ctx: any) -> bool:
    return True`,
    vesting: `# Vesting Contract
@dataclass
class VestingDatum:
    owner: str
    lock_until: int

def validate(datum: VestingDatum, redeemer: None, ctx: any) -> bool:
    return datum.owner in ctx.signatories and ctx.time >= datum.lock_until`,
    oracle: `# Oracle Consumption Logic
@dataclass
class OracleDatum:
    price: int
    expiry: int

def validate(datum: OracleDatum, redeemer: None, ctx: any) -> bool:
    return datum.price > 0 and ctx.time < datum.expiry`
  }
};

export const AIKEN_SYSTEM_PROMPT = `
You are a specialized high-performance compiler and transpiler.
Your goal is to convert Web2 code (TypeScript or Python) into valid Aiken code for Cardano smart contracts.

Aiken is a functional programming language. Key concepts to remember:
1. Use 'validator' blocks.
2. Logic is strictly functional.
3. Common modules include 'aiken/transaction', 'aiken/transaction/value', 'aiken/time'.
4. Data structures are defined with 'type'.
5. Error handling is done via 'expect' or 'fail'.
6. Validators usually take (datum, redeemer, context).

Output Format:
You MUST return a JSON object with the following structure:
{
  "aikenCode": "The full source code in Aiken",
  "explanation": "A concise explanation of how the logic was mapped to the eUTXO model and Aiken syntax.",
  "errors": "Any mapping issues or logical impossibilities (optional)"
}
`;

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'mock-1',
    timestamp: Date.now() - 1000 * 60 * 5,
    sourceLanguage: 'typescript',
    sourceCode: `function checkSigner(datum: { admin: string }, ctx: any) {\n  return ctx.signatories.includes(datum.admin);\n}`,
    result: {
      aikenCode: `type Datum {\n  admin: Hash<Blake2b_224, VerificationKey>\n}\n\nvalidator {\n  fn check_signer(datum: Datum, _redeemer: Void, ctx: ScriptContext) -> Bool {\n    list.has(ctx.transaction.extra_signatories, datum.admin)\n  }\n}`,
      explanation: "Mapped the TypeScript array check to Aiken's list.has utility."
    }
  }
];
