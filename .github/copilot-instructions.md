# Workspace Instructions & Project Isolation Rules

## 1. Mandatory Project Directory Isolation
* **NEVER dump files into the workspace root directory.**
* Before writing scripts, generating configuration files, cloning repositories, or installing dependencies, **ALWAYS create a dedicated project folder** (e.g., `01-sandbox-agent/`, `02-continual-harness/`, `03-dqn-lunarlander/`).
* Name project folders using kebab-case or numbered prefixes reflecting the task.
* In every multi-step guide or script generation, the very first command must create and move into that folder:
  ```bash
  mkdir -p <project-folder-name> && cd <project-folder-name>

2. Mandatory uv Package & Environment Management
NEVER use standard python3 -m venv or pip install.

Ensure uv is installed and on PATH first: Always verify uv availability as a prerequisite command before running any Python or package operations:

```bash
command -v uv >/dev/null 2>&1 || { curl -LsSf [https://astral.sh/uv/install.sh](https://astral.sh/uv/install.sh) | sh && source $HOME/.local/bin/env; }
Virtual Environments: Create isolated project virtual environments strictly using uv:

```bash
uv venv && source .venv/bin/activate
Dependency Installation: Add packages using uv add <package> or uv pip install <package>.

Execution: Run scripts exclusively via uv run <script.py>.

## 3. Code Generation Discipline
Output complete, self-contained files with no placeholders, no omitted functions, and no partial implementations.

Always read credentials and secrets (like GEMINI_API_KEY) from environment variables, never hardcode them into generated code.

Prefer uv for package management and script execution (uv run script.py).
