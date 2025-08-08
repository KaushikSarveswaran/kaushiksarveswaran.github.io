# Bughouse Chess

This is a simple web-based Bughouse chess application.

## How to Play

1.  **Start the server:**
    - Navigate to the `server` directory.
    - Run the following command to start the WebSocket server:
      ```
      python server.py
      ```
    - The server will be running on `localhost:8765`.

2.  **Open the game:**
    - Open the `client/index.html` file in your web browser.
    - You can open the file directly or use a simple HTTP server.

3.  **Play:**
    - Open two instances of the game in separate browser windows or tabs.
    - You can now play a game of Bughouse chess with yourself or another person on the same computer.

## How it Works

- The front-end is built with plain HTML, CSS, and JavaScript.
- The back-end is a simple Python WebSocket server that broadcasts messages to all connected clients.
- The game logic is handled on the client-side.
- The server is only used for communication between the two players.
