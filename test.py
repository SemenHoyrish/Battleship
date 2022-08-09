import asyncio
import websockets
import json
import random

class Game:
    player_one_connected = False
    player_two_connected = False
    field_one = []
    field_two = []
    field_one_shots = []
    field_two_shots = []
    turn = 0

    def __init__(self) -> None:
        self.turn = random.randint(1, 2)

games = []

def error(text):
    return json.dumps( {"status": "error", "message": text} )
def success(text):
    return json.dumps( {"status": "success", "message": text} )
def ready(text):
    return json.dumps( {"status": "ready", "message": text} )

async def game(websocket):
    while True:
        request = json.loads(await websocket.recv())
        print("ACTION:", request)
        if request["action"] == "create_game":
            games.append(Game())
            await websocket.send(success(len(games) - 1))
        elif request["action"] == "connect":
            game_id = request["game_id"]
            if not games[game_id].player_one_connected:
                await websocket.send(success(1))
            elif not games[game_id].player_two_connected:
                await websocket.send(success(2))
            else:
                await websocket.send(error("All players connected already"))

        elif request["action"] == "send_field":
            game_id = request["game_id"]
            player = request["player"]
            field = request["field"]
            if player == 1:
                if games[game_id].field_one == []:
                    games[game_id].field_one = field
                    await websocket.send(success("OK"))
                else:
                    await websocket.send(error("Field already exists"))
            elif player == 2:
                if games[game_id].field_two == []:
                        games[game_id].field_two = field
                        await websocket.send(success("OK"))
                else:
                    await websocket.send(error("Field already exists"))
            
        elif request["action"] == "get_turn":
            game_id = request["game_id"]
            await websocket.send(success(games[game_id].turn))



async def main():
    async with websockets.serve(game, "localhost", 8090):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
