import asyncio
import websockets
import json
import random
import time

class Game:
    player_one_connected = False
    player_two_connected = False
    field_one = []
    field_two = []
    field_one_shots = []
    field_two_shots = []
    turn = 0

    last_shot_time = None

    def __init__(self) -> None:
        self.turn = random.randint(1, 2)
        for i in range(10):
            row = []
            for j in range(10):
                row.append(-1)
            self.field_one_shots.append(row)
        for i in range(10):
            row = []
            for j in range(10):
                row.append(-1)
            self.field_two_shots.append(row)
        self.last_shot_time = int(time.time())
    
    def next_turn(self) -> None:
        if self.turn == 1:
            self.turn = 2
        else:
            self.turn = 1


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
        if request["action"] == "HELLO":
            await websocket.send(success("HELLO!"))
        elif request["action"] == "create_game":
            games.append(Game())
            await websocket.send(success(len(games) - 1))
        elif request["action"] == "connect":
            game_id = request["game_id"]
            if not games[game_id].player_one_connected:
                games[game_id].player_one_connected = True
                await websocket.send(success(1))
            elif not games[game_id].player_two_connected:
                games[game_id].player_two_connected = True
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

        elif request["action"] == "shot":
            game_id = request["game_id"]
            player = request["player"]
            x = request["x"] 
            y = request["y"] 
            
            if player == 1 and games[game_id].turn == 1:
                good_shot = False
                if games[game_id].field_two[y][x] == 1:
                    good_shot = True

                if not good_shot: games[game_id].next_turn()

                games[game_id].field_two_shots[y][x] = 1 if good_shot else 0
                games[game_id].last_shot_time = int(time.time())
                await websocket.send(success(1 if good_shot else 0))
            elif player == 2 and games[game_id].turn == 2:
                good_shot = False
                if games[game_id].field_one[y][x] == 1:
                    good_shot = True
                
                if not good_shot: games[game_id].next_turn()

                games[game_id].field_one_shots[y][x] = 1 if good_shot else 0
                games[game_id].last_shot_time = int(time.time())
                await websocket.send(success(1 if good_shot else 0))
            else:
                await websocket.send(error("Not your turn"))
        
        elif request["action"] == "get_shots":
            game_id = request["game_id"]
            player = request["player"]
            cur_time = int(time.time())
            print(games[game_id].last_shot_time)
            while (cur_time > games[game_id].last_shot_time):
                await asyncio.sleep(0.1)
            if player == 1:
                await websocket.send(success(games[game_id].field_one_shots))
            elif player == 2:
                await websocket.send(success(games[game_id].field_two_shots))





async def main():
    async with websockets.serve(game, "localhost", 8090):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    games.append(Game())
    asyncio.run(main())
