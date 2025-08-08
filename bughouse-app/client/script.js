document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const gameContainer = document.getElementById('game-container');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Chessboard dimensions
    const ranks = 8;
    const files = 8;

    // Initial piece setup for a standard chess game
    const initialPieceSetup = {
        'a1': '♖', 'b1': '♘', 'c1': '♗', 'd1': '♕', 'e1': '♔', 'f1': '♗', 'g1': '♘', 'h1': '♖',
        'a2': '♙', 'b2': '♙', 'c2': '♙', 'd2': '♙', 'e2': '♙', 'f2': '♙', 'g2': '♙', 'h2': '♙',
        'a8': '♜', 'b8': '♞', 'c8': '♝', 'd8': '♛', 'e8': '♚', 'f8': '♝', 'g8': '♞', 'h8': '♜',
        'a7': '♟', 'b7': '♟', 'c7': '♟', 'd7': '♟', 'e7': '♟', 'f7': '♟', 'g7': '♟', 'h7': '♟',
    };

    /**
     * Creates a chessboard and appends it to the specified container.
     * @param {string} containerId The ID of the container element.
     */
    function createBoard(containerId) {
        const chessboardContainer = document.getElementById(containerId);
        chessboardContainer.innerHTML = '';
        for (let rank = ranks; rank >= 1; rank--) {
            for (let file = 1; file <= files; file++) {
                const square = document.createElement('div');
                const isLight = (rank + file) % 2 !== 0;
                square.classList.add('square', isLight ? 'light' : 'dark');
                const fileChar = String.fromCharCode('a'.charCodeAt(0) + file - 1);
                const squareId = `${fileChar}${rank}`;
                square.dataset.id = squareId;
                square.dataset.board = containerId.split('-')[1]; // Store board number in dataset

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

    // Create the two chessboards
    createBoard('chessboard-1');
    createBoard('chessboard-2');

    // Establish WebSocket connection
    const ws = new WebSocket('ws://localhost:8765');

    /**
     * Handles incoming WebSocket messages.
     * @param {MessageEvent} event The WebSocket message event.
     */
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'move') {
            handleMove(data);
        } else if (data.type === 'drop') {
            handleDrop(data);
        } else if (data.type === 'chat') {
            handleChat(data);
        }
    };

    /**
     * Handles a piece move event.
     * @param {object} data The move data from the server.
     */
    function handleMove(data) {
        const { from, to, board } = data;
        const fromSquare = document.querySelector(`#chessboard-${board} [data-id="${from}"]`);
        const toSquare = document.querySelector(`#chessboard-${board} [data-id="${to}"]`);
        const piece = fromSquare.querySelector('.piece');

        if (piece) {
            // Handle captures
            if (toSquare.firstChild) {
                const capturedPiece = toSquare.firstChild.textContent;
                const partnerBoard = board === '1' ? '2' : '1';
                const pieceBank = document.getElementById(`piece-bank-bottom-${partnerBoard}`);
                const newPiece = document.createElement('span');
                newPiece.classList.add('piece');
                newPiece.textContent = capturedPiece;
                newPiece.draggable = true;
                pieceBank.appendChild(newPiece);
            }
            toSquare.innerHTML = '';
            toSquare.appendChild(piece);
        }
    }

    /**
     * Handles a piece drop event.
     * @param {object} data The drop data from the server.
     */
    function handleDrop(data) {
        const { piece, to, board } = data;
        const toSquare = document.querySelector(`#chessboard-${board} [data-id="${to}"]`);
        const newPiece = document.createElement('span');
        newPiece.classList.add('piece');
        newPiece.textContent = piece;
        newPiece.draggable = true;
        toSquare.innerHTML = '';
        toSquare.appendChild(newPiece);
    }

    /**
     * Handles a chat message event.
     * @param {object} data The chat message data from the server.
     */
    function handleChat(data) {
        const messageElement = document.createElement('div');
        messageElement.textContent = data.message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    let draggedPiece = null;

    // Drag and drop event listeners
    gameContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('piece')) {
            draggedPiece = e.target;
        }
    });

    gameContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow dropping
    });

    gameContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedPiece) {
            const toSquare = e.target.closest('.square');
            if (toSquare) {
                const fromElement = draggedPiece.parentElement;
                const board = toSquare.dataset.board;

                if (fromElement.classList.contains('square')) { // Piece move
                    const move = {
                        type: 'move',
                        from: fromElement.dataset.id,
                        to: toSquare.dataset.id,
                        board: board,
                    };
                    ws.send(JSON.stringify(move));
                } else { // Piece drop from bank
                    const drop = {
                        type: 'drop',
                        piece: draggedPiece.textContent,
                        to: toSquare.dataset.id,
                        board: board,
                    };
                    ws.send(JSON.stringify(drop));
                    draggedPiece.remove(); // Remove piece from the bank
                }
                draggedPiece = null;
            }
        }
    });

    // Chat event listener
    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message) {
            const chatMessage = {
                type: 'chat',
                message: message,
            };
            ws.send(JSON.stringify(chatMessage));
            messageInput.value = ''; // Clear the input field
        }
    });
});
