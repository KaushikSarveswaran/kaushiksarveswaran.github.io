document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const lobbyContainer = document.getElementById('lobby-container');
    const gameContainer = document.getElementById('game-container');
    const chatContainer = document.getElementById('chat-container');
    const statusMessage = document.getElementById('status-message');
    const roomIdInput = document.getElementById('room-id-input');
    const joinRoomButton = document.getElementById('join-room-button');
    const assignmentInfo = document.getElementById('assignment-info');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // --- State ---
    let ws = null;
    let playerRole = null;
    let current_turns = { "1": "white", "2": "white" };

    // --- WebSocket Logic ---
    function connect() {
        const serverHost = window.location.hostname || 'localhost';
        ws = new WebSocket(`ws://${serverHost}:8765`);
        ws.onopen = () => { statusMessage.textContent = 'Connected. Enter a room name to join.'; joinRoomButton.disabled = false; };
        ws.onmessage = (event) => handleServerMessage(JSON.parse(event.data));
        ws.onclose = () => { statusMessage.textContent = 'Disconnected. Please refresh.'; joinRoomButton.disabled = true; };
        ws.onerror = (error) => { console.error('WebSocket Error:', error); statusMessage.textContent = 'Error connecting.'; };
    }

    joinRoomButton.disabled = true;
    connect();

    // --- Message Handling ---
    function handleServerMessage(data) {
        switch (data.type) {
            case 'assignment':
                playerRole = { team: data.team, board: data.board, color: data.color };
                assignmentInfo.textContent = `You are Team ${playerRole.team}, Board ${playerRole.board} (${playerRole.color})`;
                break;
            case 'player_joined':
                statusMessage.textContent = `Room has ${data.player_count} / 4 players. Waiting...`;
                break;
            case 'game_start':
                lobbyContainer.classList.add('hidden');
                gameContainer.classList.remove('hidden');
                chatContainer.classList.remove('hidden');
                initializeGame();
                break;
            case 'turn_update':
                current_turns[data.board] = data.next_turn;
                updateTurnHighlight();
                break;
            case 'add_to_bank':
                const pieceBank = playerRole.color === 'white' ?
                    document.getElementById(`piece-bank-bottom-${playerRole.board}`) :
                    document.getElementById(`piece-bank-top-${playerRole.board}`);
                const newPiece = document.createElement('span');
                newPiece.classList.add('piece');
                newPiece.textContent = data.piece;
                newPiece.draggable = true;
                pieceBank.appendChild(newPiece);
                break;
            case 'move':
            case 'drop':
                updateBoard(data);
                break;
            case 'chat':
                displayChatMessage(data);
                break;
            case 'error':
                statusMessage.textContent = `Error: ${data.message}`;
                roomIdInput.disabled = false;
                joinRoomButton.disabled = false;
                break;
        }
    }

    // --- Lobby Logic ---
    joinRoomButton.addEventListener('click', () => {
        const roomId = roomIdInput.value.trim();
        if (roomId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'join', room: roomId }));
            statusMessage.textContent = `Joining room: ${roomId}...`;
            roomIdInput.disabled = true;
            joinRoomButton.disabled = true;
        }
    });

    // --- Game Logic ---
    function initializeGame() {
        createBoard('chessboard-1');
        createBoard('chessboard-2');
        setupGameEventListeners();
        updateTurnHighlight();
    }

    function createBoard(containerId) {
        // ... (createBoard logic remains the same)
    }

    function updateBoard(data) {
        // ... (updateBoard logic remains the same)
    }

    function displayChatMessage(data) {
        // ... (displayChatMessage logic remains the same)
    }

    function getPieceColor(pieceChar) {
        const whitePieces = "♔♕♖♗♘♙";
        return whitePieces.includes(pieceChar) ? 'white' : 'black';
    }

    function updateTurnHighlight() {
        document.querySelectorAll('.chessboard').forEach(board => board.classList.remove('active-turn'));
        if (playerRole) {
            const activeBoardId = `chessboard-${playerRole.board}`;
            if (current_turns[playerRole.board] === playerRole.color) {
                document.getElementById(activeBoardId)?.classList.add('active-turn');
                assignmentInfo.textContent = `Your turn! (Team ${playerRole.team}, Board ${playerRole.board}, ${playerRole.color})`;
            } else {
                 assignmentInfo.textContent = `Opponent's turn. (Team ${playerRole.team}, Board ${playerRole.board}, ${playerRole.color})`;
            }
        }
    }

    function setupGameEventListeners() {
        let draggedPiece = null;

        gameContainer.addEventListener('dragstart', (e) => {
            if (!e.target.classList.contains('piece') || !playerRole) return;

            const fromElement = e.target.parentElement;
            const pieceColor = getPieceColor(e.target.textContent);

            let boardId;
            if (fromElement.classList.contains('square')) {
                boardId = fromElement.dataset.board;
            } else if (fromElement.classList.contains('piece-bank')) {
                // Find the board associated with this piece bank
                boardId = fromElement.id.includes('1') ? '1' : '2';
            }

            // Validation checks
            if (playerRole.board.toString() !== boardId) {
                e.preventDefault(); return;
            }
            if (playerRole.color !== current_turns[boardId]) {
                e.preventDefault(); return;
            }
            if (fromElement.classList.contains('square') && playerRole.color !== pieceColor) {
                e.preventDefault(); return;
            }

            draggedPiece = e.target;
        });

        gameContainer.addEventListener('dragover', (e) => e.preventDefault());

        gameContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!draggedPiece) return;

            const toSquare = e.target.closest('.square');
            if (toSquare) {
                const boardId = toSquare.dataset.board;
                // Final check: can only drop on your own board
                if (playerRole.board.toString() !== boardId) {
                    draggedPiece = null;
                    return;
                }

                const fromElement = draggedPiece.parentElement;
                let message = null;

                if (fromElement.classList.contains('square')) {
                    const capturedPiece = toSquare.hasChildNodes() ? toSquare.firstChild.textContent : null;
                    message = { type: 'move', from: fromElement.dataset.id, to: toSquare.dataset.id, board: boardId, captured_piece: capturedPiece };
                } else if (fromElement.classList.contains('piece-bank')) {
                    message = { type: 'drop', piece: draggedPiece.textContent, to: toSquare.dataset.id, board: boardId };
                }

                if (message) {
                    ws.send(JSON.stringify(message));
                }
                draggedPiece = null;
            }
        });

        sendButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message) {
                ws.send(JSON.stringify({ type: 'chat', message: message }));
                messageInput.value = '';
            }
        });
    }

    // --- Fill in repeated functions to keep script whole ---
    function createBoard(containerId) {
        const chessboardContainer = document.getElementById(containerId);
        chessboardContainer.innerHTML = '';
        const initialPieceSetup = {
            'a1': '♖', 'b1': '♘', 'c1': '♗', 'd1': '♕', 'e1': '♔', 'f1': '♗', 'g1': '♘', 'h1': '♖', 'a2': '♙', 'b2': '♙', 'c2': '♙', 'd2': '♙', 'e2': '♙', 'f2': '♙', 'g2': '♙', 'h2': '♙',
            'a8': '♜', 'b8': '♞', 'c8': '♝', 'd8': '♛', 'e8': '♚', 'f8': '♝', 'g8': '♞', 'h8': '♜', 'a7': '♟', 'b7': '♟', 'c7': '♟', 'd7': '♟', 'e7': '♟', 'f7': '♟', 'g7': '♟', 'h7': '♟',
        };
        for (let rank = 8; rank >= 1; rank--) {
            for (let file = 1; file <= 8; file++) {
                const square = document.createElement('div');
                const isLight = (rank + file) % 2 !== 0;
                square.classList.add('square', isLight ? 'light' : 'dark');
                const fileChar = String.fromCharCode('a'.charCodeAt(0) + file - 1);
                const squareId = `${fileChar}${rank}`;
                square.dataset.id = squareId;
                square.dataset.board = containerId.split('-')[1];
                const piece = initialPieceSetup[squareId];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = piece;
                    pieceElement.draggable = true;
                    square.appendChild(pieceElement);
                }
                chessboardContainer.appendChild(square);
            }
        }
    }
    function updateBoard(data) {
        const { from, to, board, piece: droppedPiece } = data;
        const fromSquare = from ? document.querySelector(`#chessboard-${board} [data-id="${from}"]`) : null;
        const toSquare = document.querySelector(`#chessboard-${board} [data-id="${to}"]`);
        if (data.type === 'move') {
            const piece = fromSquare.querySelector('.piece');
            if (piece) { toSquare.innerHTML = ''; toSquare.appendChild(piece); }
        } else if (data.type === 'drop') {
            const newPiece = document.createElement('span');
            newPiece.classList.add('piece');
            newPiece.textContent = droppedPiece;
            newPiece.draggable = true;
            toSquare.innerHTML = '';
            toSquare.appendChild(newPiece);
        }
    }
    function displayChatMessage(data) {
        const messageElement = document.createElement('div');
        const sender = data.sender_role ? `Team ${data.sender_role.team}, Board ${data.sender_role.board}` : 'System';
        messageElement.textContent = `[${sender}]: ${data.message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
