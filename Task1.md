Act as a senior systems engineer. I need a complete, self-contained Python script named `agent_runner.py` that implements an autonomous self-debugging loop between Google Gemini and a Modal cloud sandbox.

Do NOT provide pseudocode, placeholders, or omit sections. Write the entire file with complete imports and error handling.

Architecture Requirements:
1. Use the official `google-genai` SDK (`from google import genai`) with the model "gemini-2.5-flash".
2. Use Modal (`import modal`) with an App named "gemini-cloud-sandbox".
3. Define a Modal Image (`modal.Image.debian_slim().pip_install("numpy", "pandas", "requests")`).
4. Define an ephemeral cloud function `@app.function(image=..., timeout=60)` named `cloud_exec(code_str: str) -> dict` that executes incoming code using Python's `exec()`, captures stdout/stderr in an `io.StringIO` buffer, traps exceptions with `traceback.format_exc()`, and returns a dictionary `{"output": str, "error": str | None}`.
5. In the main orchestrator loop, prompt Gemini to solve a concrete task (e.g. "Calculate the moving average of a sample NumPy array and print the result"). Extract the code between ```python and ``` markers.
6. Dispatch execution to Modal via `cloud_exec.remote(code)`.
7. If `error` is present, append the error traceback to the Gemini chat history and loop again (up to 3 retries). If execution succeeds, print the cloud output and break.
8. Read the API key cleanly from the environment variable `GEMINI_API_KEY`.

After generating the code, provide the exact 3 terminal commands needed to install dependencies, authenticate Modal, and execute the script.