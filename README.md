# Agent Language Benchmark Runner

Run the same programming tasks through Codex and Claude in Dark, Python and TypeScript, then compare session time, token usage and reported cost in a local dashboard.

We use this runner to compare agent sessions and find ways to improve Dark. It measures **command-line sessions** (CLI sessions). A completed session means the agent finished without reporting an error; it does not prove the generated program is correct. The runner does not grade the programs itself.

## Requirements

- macOS or Linux and Node.js 22 or newer.
- At least one supported agent CLI (`codex` or `claude`), installed and logged in with your own account. The runner checks for the CLI options it needs.
- Tools for the languages you select: Python uses `python3`; TypeScript uses Node.js and any additional tools you have installed; Dark needs a local executable you supply.

There are no npm dependencies to install. The runner does not install language tools or project dependencies for you. **Run the program**, the manual code execution feature, requires macOS.

## Quick start

Clone this repository, open a terminal in its folder, and run:

```sh
npm start
```

Open <http://127.0.0.1:4317>. Opening the dashboard does not start an agent.

1. Name your configuration and enable one agent you have installed and logged in to. Check its executable path; leave the model on **CLI default**.
2. Enable **Python** and disable the other languages. Make sure `python3` is available.
3. Under **Tasks**, select only **fizzbuzz**.
4. Under **Limits**, choose one run per task and a five-minute limit.
5. Leave the output folder at its default and click **Check environment**.
6. Click **Review & run**, read the prompts and settings, then click **Start batch**.

Starting a batch uses your agent account and quota, including a small login-check request for each selected agent. Reports also use agent quota. Follow **Agent activity**, then open the finished attempt to inspect its transcript and **Check code**.

An attempt is one task, language, agent and repetition. Attempts run one at a time, in shuffled order. Configurations are saved in your browser; results are saved on disk.

## Configuration

The dashboard controls agents, models, languages, task prompts, repetitions, time limits and output paths. The default attempt limit is 45 minutes.

| Environment variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Local dashboard port | `4317` |
| `DARK_PATH` | Prefill the Dark executable path | Empty |

For example:

```sh
PORT=4318 DARK_PATH=/absolute/path/to/dark npm start
```

The server listens on `127.0.0.1`. Run it from the repository folder so results and history use consistent locations.

## Results and limitations

Time and usage come from the agent session. Missing measurements stay blank, and cost is shown only when the CLI reports it. Subscription fees are not included. Comparisons use medians for matching tasks, agents, models and outcomes. Dark comparisons are the dashboard's primary focus.

Each attempt starts with a fresh project and conversation. Dark also gets a fresh environment using a private copy of your supplied executable and an empty package store. This setup happens before timing starts; downloading, building and installing Dark are not measured. Existing CLI settings, instructions, memory, hooks and plugins can still influence results. Results depend on your tools and settings. They do not establish which language is better overall.

Results, prompts, transcripts and reports are saved under `results/` by default. Generated projects live separately in temporary workspaces; each attempt's `final-project.json` records its location. Finished batches reload after a restart. Active work and queued batches do not resume.

## Safety and privacy

Keep the dashboard on localhost; it is intended for one person on their own machine. Agents can run commands, read files outside their projects, and use the server's environment variables and your usual CLI settings. Use prompts you trust and start the server from a terminal without unrelated secrets.

Agent sandboxes and the macOS **Run the program** feature provide limited protection. Manual runs can still access the network and read outside your home folder. Use a disposable machine or virtual machine if you need stronger isolation. See the [usage guide](USAGE.md#permissions-and-network-access) for details.

The runner removes known credentials from saved logs, but prompts, transcripts, reports and generated code can still contain private information. Review saved files before sharing them. `results/`, `.cache/` and local environment files are ignored by Git; keep custom output folders outside the repository. Ignore rules do not remove files already in Git history.

## Documentation

- [Usage guide](USAGE.md): configure comparisons, inspect code, run programs, create reports and delete batches.
- [How the runner works](HOW-THE-RUNNER-WORKS.md): prompts, isolation, timing, outcomes and saved evidence.
- [Public release checklist](RELEASING.md): organization details, licensing and publication checks.

## Development

Run `npm test` to check the runner with fake agents without spending agent quota. Two manual-run integration tests require macOS; run them in a terminal that permits `sandbox-exec`.

Use `npm run dev` while editing. It restarts the server when `src/` changes, interrupting active work and losing the waiting queue. Use `npm start` for real benchmarks, and refresh the dashboard after editing browser files.
