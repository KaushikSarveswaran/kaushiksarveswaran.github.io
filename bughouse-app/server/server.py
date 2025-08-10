import asyncio
import websockets
import json
import itertools

# In-memory storage for game states
GAME_STATE = {}

# Player roles are assigned in a fixed order as players join a room
PLAYER_ROLES = [
    {"team": "A", "board": 1, "color": "white"},
    {"team": "B", "board": 1, "color": "black"},
    {"team": "A", "board": 2, "color": "black"},
    {"team": "B", "board": 2, "color": "white"},
]

async def handler(websocket, path):
    """
    Handles WebSocket connections and game logic.
    """
    player_room = None
    player_id = None
    room_id = None

    try:
        message = await websocket.recv()
        data = json.loads(message)

        if data['type'] == 'join':
            room_id = data['room']
            if room_id not in GAME_STATE:
                GAME_STATE[room_id] = {
                    "players": [],
                    "assignments": {},
                    "board_states": {
                        "1": {"turn": "white"},
                        "2": {"turn": "white"}
                    }
                }

            room = GAME_STATE[room_id]

            if len(room['players']) >= 4:
                await websocket.send(json.dumps({"type": "error", "message": "Room is full"}))
                return

            player_id = len(room['players'])
            role = PLAYER_ROLES[player_id]
            room['players'].append(websocket)
            room['assignments'][websocket] = role
            player_room = room

            await websocket.send(json.dumps({"type": "assignment", **role}))
            await broadcast(room, json.dumps({"type": "player_joined", "player_count": len(room['players'])}))

            if len(room['players']) == 4:
                await broadcast(room, json.dumps({"type": "game_start"}))
                # Announce initial turns
                await broadcast(room, json.dumps({"type": "turn_update", "board": 1, "next_turn": room['board_states']['1']['turn']}))
                await broadcast(room, json.dumps({"type": "turn_update", "board": 2, "next_turn": room['board_states']['2']['turn']}))

        async for message in websocket:
            data = json.loads(message)
            action_type = data.get('type')

            if action_type in ['move', 'drop']:
                if is_valid_action(player_room, websocket, data):
                    # Broadcast the action
                    data['sender_role'] = player_room['assignments'][websocket]
                    await broadcast(player_room, json.dumps(data)) # Broadcast to all including self for state sync

                    # Handle captures for moves
                    if action_type == 'move' and data.get('captured_piece'):
                        await handle_capture(player_room, websocket, data['captured_piece'])

                    # Flip turn and announce
                    board_id = str(data['board'])
                    current_turn = player_room['board_states'][board_id]['turn']
                    next_turn = "black" if current_turn == "white" else "white"
                    player_room['board_states'][board_id]['turn'] = next_turn

                    await broadcast(player_room, json.dumps({"type": "turn_update", "board": int(board_id), "next_turn": next_turn}))
                else:
                    await websocket.send(json.dumps({"type": "error", "message": "Not your turn or invalid move!"}))

            elif action_type == 'chat':
                data['sender_role'] = player_room['assignments'][websocket]
                await broadcast(player_room, json.dumps(data))

    finally:
        if player_room and websocket in player_room['players']:
            # ... (cleanup logic as before) ...
            pass # Simplified for brevity

def is_valid_action(room, websocket, action_data):
    """
    Validates if a player is allowed to perform a given action.
    """
    player_role = room['assignments'].get(websocket)
    if not player_role:
        return False

    board_id = str(action_data.get('board'))
    if board_id not in room['board_states']:
        return False

    # Check if it's the player's turn on that board
    expected_turn = room['board_states'][board_id]['turn']

    return player_role['color'] == expected_turn

async def handle_capture(room, capturing_player_ws, captured_piece):
    capturing_player_role = room['assignments'][capturing_player_ws]
    for ws, role in room['assignments'].items():
        if role['team'] == capturing_player_role['team'] and ws is not capturing_player_ws:
            teammate_ws = ws
            break
    else:
        return
    await teammate_ws.send(json.dumps({"type": "add_to_bank", "piece": captured_piece}))

async def broadcast(room, message, exclude=None):
    if exclude is None:
        exclude = []
    for client_ws in room['players']:
        if client_ws not in exclude:
            await client_ws.send(message)

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("Server started on ws://0.0.0.0:8765")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
