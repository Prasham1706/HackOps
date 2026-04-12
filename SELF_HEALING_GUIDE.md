# FlowMind Self-Healing Guide

## What Self-Healing Means In This Project

FlowMind uses a practical self-healing model during workflow execution.

It has 3 parts:

1. Node retry with backoff
   - If a node fails, FlowMind retries it automatically.
   - This helps recover from temporary or flaky failures.

2. One-shot DAG regeneration
   - If the failure looks like a workflow-planning problem, FlowMind sends the original user goal, the previous DAG, the failed node, and the error back to Gemini.
   - Gemini generates a repaired DAG.
   - FlowMind updates the workflow graph and starts again from the repaired plan.

3. Safe stop for non-repairable failures
   - If the failure is an infrastructure problem such as DNS failure, network outage, invalid token, or missing API configuration, FlowMind does not keep looping forever.
   - It stops safely and shows the real error.

This is still self-healing because the system:
- retries automatically
- attempts plan repair automatically
- avoids infinite failure loops

## Why This Is The Right Self-Healing Scope

For this project, self-healing is designed to be:

- practical
- demo-friendly
- stable enough for deployment

Instead of pretending all failures can be solved automatically, FlowMind separates:

- repairable workflow errors
- non-repairable external service errors

That makes the system more honest and more reliable.

## Self-Healing Demo Prompt

Use this prompt in Workflow Builder:

```text
Read the latest unread Gmail email, summarize it with Gemini, and create a Notion task with the summary
```

## What Judges Should See

### Normal execution path

1. Gmail reads the latest unread email
2. Gemini summarizes it
3. Notion creates a task

### Self-healing behavior

If a step fails:

- FlowMind retries the failed node automatically
- If the failure appears to be caused by workflow logic, FlowMind regenerates the DAG using Gemini
- If the failure is caused by external infrastructure, FlowMind stops with a clear diagnostic instead of looping forever

## Example Judge Explanation

You can explain it like this:

> FlowMind uses self-healing execution in two layers. First, each node automatically retries with backoff for transient failures. Second, if the failure looks like a planning problem, the system sends the original goal, previous DAG, and runtime failure context back to Gemini to generate a repaired DAG and rerun the workflow. If the problem is external, such as DNS, auth, or service outage, FlowMind stops safely with a clear error instead of endlessly retrying.

## Example Prompts

### Prompt 1: Gmail + Gemini + Notion

```text
Read the latest unread Gmail email, summarize it with Gemini, and create a Notion task with the summary
```

Use this for the main self-healing explanation.

### Prompt 2: GitHub + Gemini + Notion

```text
Read the latest open GitHub issue, summarize it with Gemini, and create a Notion task
```

Use this if GitHub is more stable in your environment than Gmail.

### Prompt 3: Gmail + Gemini

```text
Read the latest unread Gmail email and summarize it with Gemini
```

Use this if you want a simpler 2-step demo.

## What Counts As Repairable

Examples:

- missing transformation step
- wrong action selected
- wrong service order
- missing summarization between source and destination

For these cases, DAG regeneration is useful.

## What Does Not Count As Repairable

Examples:

- DNS failure
- network outage
- invalid token
- expired credentials that cannot be refreshed
- third-party service outage

For these cases, FlowMind stops cleanly and exposes the real problem.

## Best Judge-Friendly Summary

```text
Self-healing in FlowMind means the system does not fail immediately on the first error. It first retries automatically, then attempts one DAG repair if the workflow logic appears fixable, and finally stops safely for non-repairable external failures.
```

## Best Prompt To Use Live

If your Gmail and Notion integrations are active:

```text
Read the latest unread Gmail email, summarize it with Gemini, and create a Notion task with the summary
```

If GitHub is more reliable in your environment:

```text
Read the latest open GitHub issue, summarize it with Gemini, and create a Notion task
```
