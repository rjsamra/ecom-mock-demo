---
name: plan-feature
description: Plan a ShopSphere feature. Inspect the code and instructions, then wait for approval before editing files.
argument-hint: Describe the feature to plan
---

Plan the feature the developer describes with this prompt. Do not implement it. Do not create, edit, or delete files.

If no feature is described, ask for one and stop. The feature is whatever they request. Do not substitute an example feature.

## 1. Understand the request

Restate the requested outcome. List ambiguities that would change the plan. For each one, give the assumption you will use if the developer does not choose.

## 2. Inspect the code

Read the existing routes, feature modules, shared components, and tests the feature would touch. Name the files you read. Reuse the current catalog, cart, and checkout boundaries. Do not invent a database, authentication, payment, or external service.

## 3. Apply instructions

Read `.github/copilot-instructions.md`. Read `.github/instructions/application.instructions.md` when the plan would change `src/**/*.ts` or `src/**/*.tsx`. Read `.github/instructions/tests.instructions.md` when the plan would change `tests/**` or `e2e/**`. State which files apply and which constraints affect this plan.

## 4. Propose files

List the smallest set of files to add or change. For each file, say why it is needed. Leave out unrelated refactoring.

## 5. Define acceptance

Write acceptance criteria a shopper or caller can observe. List edge cases. List test scenarios for success, failure, and boundaries. Use Vitest for feature behavior and Playwright only for a shopper-facing flow. Assert observable behavior, not private implementation.

## 6. Identify risks

Name existing behavior that could regress. Include catalog search, cart stock, pricing, and simulated checkout when the plan touches those areas.

## 7. Wait

Present the plan. Stop and wait for explicit approval before editing files.
