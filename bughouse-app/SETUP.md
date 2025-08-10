# Bughouse Chess - 4-Player Setup Guide

This guide provides step-by-step instructions to set up and host a 4-player bughouse chess game on your local network.

## Overview

One person will act as the **Host**, running both the game server and serving the game files. The other three players will be **Clients** who connect to the Host's computer through their web browsers. All players must be on the same local network (e.g., connected to the same Wi-Fi).

## Requirements

-   **Python 3**: The Host needs Python 3 installed on their computer. You can download it from [python.org](https://www.python.org/).
-   **A modern web browser**: All players need a browser like Chrome, Firefox, or Safari.

---

## 1. Host Setup Instructions

Follow these steps if you are the person hosting the game.

### Step 1: Find Your Local IP Address

You will need this so other players can connect to you.
-   **Windows**: Open Command Prompt (`cmd`) and type `ipconfig`. Look for the "IPv4 Address" under your active network connection (e.g., Wi-Fi). It will likely start with `192.168.x.x`.
-   **macOS/Linux**: Open the Terminal and type `ifconfig` or `ip addr`. Look for the "inet" address.

**Example:** Let's assume your IP address is `192.168.1.105`. Remember this for later.

### Step 2: Set Up and Run the Game Server

1.  **Open a terminal/command prompt** and navigate to the `bughouse-app` directory from this project.
2.  **Create a virtual environment** (recommended). This keeps dependencies clean.
    ```bash
    python -m venv venv
    ```
3.  **Activate the virtual environment.**
    -   Windows: `venv\\Scripts\\activate`
    -   macOS/Linux: `source venv/bin/activate`
4.  **Install the required dependencies.**
    ```bash
    pip install -r server/requirements.txt
    ```
5.  **Run the WebSocket game server.**
    ```bash
    python server/server.py
    ```
    You should see a message like `Server started on ws://0.0.0.0:8765`. **Leave this terminal open.** The server is now running.

### Step 3: Serve the Game Files

1.  **Open a new, second terminal/command prompt.**
2.  **Navigate to the `bughouse-app` directory again.**
3.  **Activate the virtual environment in this new terminal.**
    -   Windows: `venv\\Scripts\\activate`
    -   macOS/Linux: `source venv/bin/activate`
4.  **Navigate into the `client` directory.**
    ```bash
    cd client
    ```
5.  **Start the simple HTTP server.**
    ```bash
    python -m http.server
    ```
    You should see a message like `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)`. **Leave this terminal open as well.**

**The Host setup is complete!** You now have two servers running in two separate terminals.

---

## 2. Player Setup Instructions (For All 4 Players)

All four players (including the Host) should now do the following.

1.  **Open your web browser.**
2.  In the address bar, type in the Host's local IP address followed by `:8000`.
    -   Using our example IP: `http://192.168.1.105:8000`
3.  You should see the Bughouse Chess lobby page.
4.  **All four players must enter the exact same Room Name** into the input field.
5.  Click **"Join Room"**.
6.  As players join, the status message will update. Once the fourth player joins, the game will automatically start. Your assigned team, board, and color will be displayed at the top of the page.

Enjoy the game!
