# How the runner works

A batch is a full comparison. An attempt is one task, in one language, with one agent, for one repetition.

## Before a batch starts

Click **Check environment** at the bottom of the dashboard's left-hand settings panel to check your settings, task text, CLI versions and available tools. If Dark is selected, the check uses a temporary copy of Dark and deletes it afterward.

**Review & run**, next to it, runs the same checks and shows the exact prompts, executable paths, launch options, environment changes, time limits and project locations. If the prompts change after review, the runner asks you to review them again.

Clicking **Start batch** sends a small request to each selected agent to check its login. These requests use agent quota. Checking the environment and reviewing the settings do not send agent requests.

## Each attempt gets its own environment

The runner gives each attempt a separate working folder in your system's temporary directory and a new agent conversation. It checks that no existing project or project instruction files will interfere with the attempt.

For Dark, each attempt gets a **fresh Dark environment** using the executable you provide. The runner copies that executable and its startup files into a private folder, with an empty package store and a separate folder for extracted .NET files. Your existing Dark packages, logs and permissions are not copied, and attempts do not share package changes. The executable must be able to initialize the empty store from its own package data.

Python and TypeScript use the tools already available on your machine. All agents use your existing CLI login and settings, so your instructions, memory, hooks and plugins can still affect results. The runner cannot list everything the CLI may load.

## During an attempt

Attempts run one at a time in shuffled order. The runner saves that order so you can check it later.

The agent receives the task and language guidance shown in the review. For Dark, this includes its executable path, version and any documentation you supplied. The agent chooses how to build and test the program, and is asked to explain anything that stopped it from finishing without installing dependencies.

The runner does not grade the program, require a particular output format or send follow-up prompts to repair the work. Messages, commands and errors appear in **Agent activity**.

An attempt can end with these statuses:

- **Completed:** the CLI finished without reporting an error. This does not prove the program works.
- **Environment blocked:** a permission or CLI problem stopped the attempt.
- **Limit reached:** the time ran out.
- **Cancelled:** you stopped the attempt.

For now, attempts run without human input: you cannot answer the agent's questions or approve requests during a run. Notes are only for your records. We want to add interactive sessions so the benchmark can also reflect how people answer questions, grant permissions and guide agents in everyday use.

**Cancel** stops the agent and its ordinary child processes; a process that deliberately separates itself may keep running.

## Time, tokens and cost

Timing starts just before the task prompt is sent and includes the agent's own tests and repairs. The default limit is 45 minutes. Environment checks, login checks and project setup are excluded. The runner uses an already-built Dark executable, so it does not measure downloading, building or installing Dark.

Tokens and cost come from the CLI. Missing values stay blank. Input totals include cached input, and reasoning tokens are not counted twice. User prompts and model calls are recorded separately; Codex model-call counts stay blank when they are unavailable.

Comparisons use medians for matching tasks, agents, models, languages, outcomes and checking methods. Dark's time and cost are compared with matching completed sessions. Older results with automatic checks stay separate from newer sessions without those checks. Failed and blocked attempts keep their measured time and usage too.

## What gets saved

The output folder contains settings, tool versions, prompts, full CLI logs and run records, plus JSON and CSV results. The runner removes known secrets and common credential formats from logs, but saved files can still contain private information. Review them before sharing.

After each attempt, the runner saves the project under `runs/<attempt>/project/` in the batch's output folder. This happens after timing stops, includes partial work, and skips links and special files. `final-project.json` records its location. The code viewer and manual runs use this saved copy. Older attempts still rely on temporary folders.

After a batch finishes, the runner saves file fingerprints (hashes) in `frozen.json` so it can detect changes before creating a report.

Finished batches and reports reload after a restart. Active attempts and waiting batches do not resume.

**Delete batch** asks for confirmation, then removes the batch's results, logs, reports, generated projects and private Dark environments. It keeps the configuration in the sidebar. Stop active work and wait for reports to finish before deleting a batch.

## The Dark report

Once a batch is finished and the runner is idle, **Create Dark report** starts a separate agent conversation. You can review its instructions in the dashboard first.

The agent receives the saved results, Dark transcripts and CLI errors. Older batches may also include automatic check results. The report describes problems supported by those logs: repeated failed commands, confusing errors, missing functions or packages, and places where time may have been lost. It says whether each problem was resolved and distinguishes a missing feature from something the agent failed to find.

The report session has a 15-minute limit. Its report, logs, tokens, cost and time are saved separately from benchmark measurements. Its findings are never sent back into attempts.

Click **View report** to read it. Use **Close** or Esc to dismiss it.
