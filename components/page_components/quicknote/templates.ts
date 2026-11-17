import { timestamp } from "./text_commands";

export const TEMPLATES: Array<{ name: string; build: () => string }> = [
  {
    name: "Release note",
    build: () => `# Release vX.Y.Z · ${timestamp().split(" ")[0]}

## What's new
-

## Improvements
-

## Bug fixes
-

## Upgrade notes
>
`,
  },
  {
    name: "Prompt",
    build: () => `## Role
You are

## Context


## Task


## Constraints
-

## Output format

`,
  },
  {
    name: "Meeting notes",
    build: () => `# Meeting · ${timestamp()}

**Attendees:**

## Agenda
1.

## Notes
-

## Action items
- [ ]
`,
  },
  {
    name: "Bug report",
    build: () => `## Summary


## Steps to reproduce
1.

## Expected


## Actual


## Environment
-
`,
  },
];
