# Using the benchmark runner

Start with the [quick start](README.md#quick-start), then use this guide for larger comparisons. For measurement details, see [How the runner works](HOW-THE-RUNNER-WORKS.md).

## Set up a comparison

1. Name your configuration and choose Codex, Claude or both. Check the path to each agent and choose a model. Leave **CLI default** selected to use the agent’s usual model, or choose **Custom model…** to enter an exact name.
2. Choose the languages. Dark needs a local binary path; set it in the dashboard, or start with `DARK_PATH=/path/to/dark npm start` to prefill it. Its documentation and build label are optional. Python and TypeScript only need to be enabled.
3. Select tasks, repetitions, time limits and an output folder.
4. Check the environment, review the configuration and start.

Codex’s model list comes from its local cache. Claude’s list is maintained in `src/model-choices.js`. If a model is missing, choose **Custom model…** and enter its name.

An attempt is one task, in one language, with one agent. Attempts run one at a time in a shuffled order. Each starts with a new project folder and conversation. The default time limit is 45 minutes.

Before you start, the review screen shows every prompt and the settings used to launch the agents. The runner sends your task text and the language guidance shown there. It does not send follow-up prompts or ask the agent to repair its work.

The default tasks ask the agent to test its program and explain what happened. The runner does not check the program itself or require a particular command or output format. **Completed** means the CLI finished without reporting an error. Read the transcript to see whether the program worked.

### Permissions and network access

Agents can edit their project files and run commands without approval prompts. Codex uses `workspace-write`. Claude uses `acceptEdits` and runs shell commands inside its sandbox. Both can read files outside the project.

Network access is off unless a task lists **Network sites**. For example, GitHub-stats allows `api.github.com` and `github.com`. The runner passes this list to the sandbox, not to the agent's prompt. Requests to other hosts are blocked.

These sessions cannot show approval dialogs. If an action needs approval, it is denied. Permission problems can leave an attempt marked **environment blocked**. **Cancel** stops the agent and its ordinary child processes.

### Dark setup

Each attempt uses a **fresh Dark environment** built from the executable you provide. It gets its own copy of the executable and startup files, an empty package store, and a separate folder for extracted .NET files. The executable initializes the store from its own package data. Your existing Dark packages, logs and permissions are not copied, and attempts do not share package changes.

The review shows these paths and environment variables. This uses an already-built executable, so it does not measure downloading, building or installing Dark. Copying the executable and setting up its store happen before timing starts. Your agent login, settings and memory still come from your usual CLI setup.

### Follow an attempt

The **Agent activity** feed shows messages, commands, results and errors. Expand a command to see more detail. The runner also saves the original JSONL logs and error output, and reloads recent activity after a restart. Notes you add are saved but are not sent to the agent.

## Read the results

Results are ordered from fastest to slowest. The comparison table shows how Dark’s token use, cost and time compare with other languages for each task. It uses the median result for matching sessions with the same agent and model. For example, **2× the tokens of Python** or **0.5× the cost of TypeScript**. Individual times and raw usage remain in the attempts table.

Failed attempts keep their measured time and usage. Missing measurements appear as **—**, not zero. Only CLI-reported cost is shown; subscriptions are not counted. These are CLI results and may differ from editor or desktop sessions.

Configurations are saved in your browser. Results, prompts and logs go in your chosen output folder. The runner saves JSON and CSV results and reloads finished batches and reports after a restart.

### Check the generated code

Click an attempt, then **Check code**, to browse its files. The viewer only reads the files.

On macOS, **Run the program** lets you try a command in a fresh copy of the project. The suggested command is a guess; you can edit it. You can see its output, errors and exit code. Dark commands use the attempt's own binary and package store through `$DARK`, including any permissions the agent granted there.

Manual runs use the macOS sandbox. It blocks access to your home folder and limits file writes to the temporary copy and the attempt's runtime folders. It allows network access and reads elsewhere on the machine. The command gets a small environment for finding tools and using temporary folders, rather than your full environment.

A manual run lasts at most 60 seconds and must wait until benchmarks and reports finish. Its results go in `manual-runs/`, separate from the benchmark results. Close the popup with **Close** or Esc. The original generated project stays in place; `final-project.json` records its location.

### Reports and cleanup

After a batch finishes, click **Create Dark report** to review the saved results and logs in a separate agent session. The report uses short, readable bullets to point out problems, repeated attempts, missing functions or packages, and what may have taken the most time. It only includes timing claims supported by the logs. Click **View report** to read it in a popup, and **Close** or Esc to dismiss it. Analysis time, tokens and cost stay separate from benchmark results.

Use **Delete batch** beside the batch title to remove the entire batch: all attempts, results, logs, reports, generated projects and its private Dark runtimes. The sidebar configuration stays. Cancel active work and wait for analysis to finish before deleting.

Older results that used automatic checks stay saved. Comparisons keep those results separate from sessions marked completed without those checks.

The runner uses your existing agent login and settings; its memory, plugins and instructions may still influence a session. It does not copy authentication files, and it redacts known credentials from saved logs.

For a step-by-step explanation, read [What the runner does behind the scenes](HOW-THE-RUNNER-WORKS.md).

