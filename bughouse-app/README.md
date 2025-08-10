# Bughouse Chess

A web-based, 4-player bughouse chess application built with HTML, CSS, JavaScript, and a Python WebSocket backend.

## Features

-   **Real-time Multiplayer**: Play with 4 players on a local network.
-   **Dual Chess Boards**: Two interactive chess boards for simultaneous gameplay.
-   **Bughouse Rules**: Capture pieces and pass them to your teammate's "piece bank" for them to use.
-   **Lobby System**: Create and join game rooms easily.
-   **Real-time Chat**: Communicate with all players during the game.
-   **PWA-Ready**: The application can be "installed" on mobile devices for an app-like experience (requires user-provided icons).

## How to Play

For detailed instructions on how to set up a server and play a 4-player game, please see the **[4-Player Setup Guide](SETUP.md)**.

## How it Works

-   The front-end is a single-page application built with plain HTML, CSS, and JavaScript.
-   The back-end is a Python server using `websockets` to manage game rooms, player connections, and real-time messaging.
-   The server assigns players to teams and boards and enforces turn-based gameplay.
-   The application is self-hostable and does not rely on any external cloud services.
