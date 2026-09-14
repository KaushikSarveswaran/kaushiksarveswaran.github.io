Act as a DevOps and reinforcement learning specialist. I am in a cloud GitHub Codespace and want to set up and run the `continual-harness` repository (https://github.com/sethkarten/continual-harness) using Pokémon Red and my Gemini API key.

Generate a self-contained bash script named `setup_and_run.sh` that automates this entire setup reliably.

The script must:
1. Verify `GEMINI_API_KEY` is set in the environment; exit with a clear message if it is missing.
2. Install `uv` via `curl -LsSf https://astral.sh/uv/install.sh | sh` if `uv` is not found on PATH, and source `$HOME/.local/bin/env`.
3. Check if the `continual-harness` directory exists; if not, run `git clone https://github.com/sethkarten/continual-harness.git`.
4. Enter the `continual-harness` directory and run `uv sync` to install all dependencies from `uv.lock`.
5. Check for the existence of the Pokémon Red ROM. Check both expected paths: `PokemonRed-GBC/pokered.gbc` and `pokemon_red_env/pokered.gbc`. If absent, print a message informing the user to place their legally dumped ROM at `continual-harness/PokemonRed-GBC/pokered.gbc` and pause with a `read -p "Press Enter once the ROM is in place..."` prompt.
6. Once the ROM is detected, execute the harness run command using `uv run`:
   uv run python run.py \
     --game red \
     --scaffold continualharness \
     --enable-prompt-optimization \
     --optimization-window-length 50 \
     --backend gemini \
     --model-name gemini-2.5-flash \
     --port 8000 \
     --agent-auto

Make the script idempotent, include `set -e` where appropriate, and provide the one-line command to make it executable and run it (`chmod +x setup_and_run.sh && ./setup_and_run.sh`).