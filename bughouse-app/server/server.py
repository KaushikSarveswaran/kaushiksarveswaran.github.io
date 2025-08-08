import asyncio
import websockets

connected_clients = set()

async def handler(websocket, path):
    # Add new client to the set of connected clients
    connected_clients.add(websocket)
    try:
        # Keep the connection open and listen for messages
        async for message in websocket:
            # When a message is received, broadcast it to all connected clients
            for client in connected_clients:
                await client.send(message)
    finally:
        # When the connection is closed, remove the client from the set
        connected_clients.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
