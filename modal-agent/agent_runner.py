import io
import os
import re
import sys
import traceback
from google import genai
import modal

# Define Modal App and execution environment
app = modal.App("gemini-cloud-sandbox")
image = modal.Image.debian_slim().pip_install("numpy", "pandas", "requests")


@app.function(image=image, timeout=60)
def cloud_exec(code_str: str) -> dict:
    """Execute Python code in an ephemeral cloud container, capturing stdout, stderr, and tracebacks."""
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    original_stdout = sys.stdout
    original_stderr = sys.stderr
    error = None

    try:
        sys.stdout = stdout_buffer
        sys.stderr = stderr_buffer
        exec_globals = {}
        exec(code_str, exec_globals)
    except Exception:
        error = traceback.format_exc()
    finally:
        sys.stdout = original_stdout
        sys.stderr = original_stderr

    output = stdout_buffer.getvalue() + stderr_buffer.getvalue()
    return {"output": output, "error": error}


def extract_python_code(response_text: str) -> str:
    """Extract Python code block wrapped in markdown fences, or return raw text if none found."""
    match = re.search(r"```(?:python)?\s*\n(.*?)```", response_text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return response_text.strip()


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    # Initialize Google GenAI client and start a multi-turn chat session
    client = genai.Client(api_key=api_key)
    chat = client.chats.create(model="gemini-2.5-flash")

    initial_task = (
        "Calculate the moving average of a sample NumPy array and print the result. "
        "Provide only self-contained, executable Python code wrapped in ```python ... ``` code blocks."
    )

    print(f"Task: {initial_task}\n")
    print("Requesting initial code solution from Gemini...")
    response = chat.send_message(initial_task)

    max_retries = 3
    with app.run():
        for attempt in range(1, max_retries + 1):
            print(f"\n--- Execution Attempt {attempt}/{max_retries} ---")
            code = extract_python_code(response.text)
            print("Generated Code:")
            print("-" * 50)
            print(code)
            print("-" * 50)

            print("Dispatching execution to Modal cloud sandbox...")
            result = cloud_exec.remote(code)

            output = result.get("output", "")
            error = result.get("error")

            if error:
                print(f"Execution Failed with Error:\n{error}")
                if attempt < max_retries:
                    retry_prompt = (
                        f"The code execution failed in the cloud environment with the following traceback:\n"
                        f"```\n{error}\n```\n"
                        f"Please fix the bug and return the complete updated Python code wrapped in ```python ... ```."
                    )
                    print("Sending error traceback to Gemini for self-debugging...")
                    response = chat.send_message(retry_prompt)
                else:
                    print("Reached maximum retry limit. Debugging loop ended with errors.")
            else:
                print("\nExecution Succeeded in Modal Cloud Sandbox!")
                print("Cloud Output:")
                print("=" * 50)
                print(output if output else "[No stdout produced]")
                print("=" * 50)
                break


if __name__ == "__main__":
    main()
