import asyncio
import websockets
import json
import random
import time

class Game:
    player_one_connected = False
    player_two_connected = False
    game_ended = False
    field_one = []
    field_two = []
    field_one_shots = []
    field_two_shots = []
    field_one_ships = []
    field_two_ships = []
    field_one_flooded_ships = 0
    field_two_flooded_ships = 0
    turn = 0
    winner = 0

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

        
    def find_ships(self) -> None:
        def get_cell(field, x, y):
            if x < 0 or x >= 10 or y < 0 or y >= 10: return -1000
            return field[y][x]

        ship = [] # [ {x, y}, [x, y] ]
        for y in range(10):
            for x in range(10):
                if (get_cell(self.field_one, x, y) == 1
                    and get_cell(self.field_one, x - 1, y) != 1
                    and get_cell(self.field_one, x, y - 1) != 1):

                    i = 0
                    while get_cell(self.field_one, x + i, y) == 1:
                        ship.append( [x + i, y] )
                        i += 1
                    i = 1
                    while get_cell(self.field_one, x, y + i) == 1:
                        ship.append( [x, y + i] )
                        i += 1
                    self.field_one_ships.append(ship)
                    ship = []
        ship = []
        for y in range(10):
            for x in range(10):
                if (get_cell(self.field_two, x, y) == 1
                    and get_cell(self.field_two, x - 1, y) != 1
                    and get_cell(self.field_two, x, y - 1) != 1):

                    i = 0
                    while get_cell(self.field_two, x + i, y) == 1:
                        ship.append( [x + i, y] )
                        i += 1
                    i = 1
                    while get_cell(self.field_two, x, y + i) == 1:
                        ship.append( [x, y + i] )
                        i += 1
                    self.field_two_ships.append(ship)
                    ship = []
        print(self.field_one_ships)
        print(self.field_two_ships)
    
    def check_ships(self) -> None:
        def fill_area(field, field_shots, ship):
            for x, y in ship:
                if x - 1 >= 0 and field[y][x - 1] != 1:
                    field_shots[y][x - 1] = 0
                if x + 1 >= 0 and field[y][x + 1] != 1:
                    field_shots[y][x + 1] = 0
                if x - 1 >= 0 and y - 1 >= 0  and field[y - 1][x - 1] != 1:
                    field_shots[y - 1][x - 1] = 0
                if x - 1 >= 0 and y + 1 < 10  and field[y + 1][x - 1] != 1:
                    field_shots[y + 1][x - 1] = 0
                if y - 1 >= 0  and field[y - 1][x] != 1:
                    field_shots[y - 1][x] = 0
                if y + 1 < 10  and field[y + 1][x] != 1:
                    field_shots[y + 1][x] = 0
                if x + 1 >= 0 and y - 1 >= 0  and field[y - 1][x + 1] != 1:
                    field_shots[y - 1][x + 1] = 0
                if x + 1 >= 0 and y + 1 < 10  and field[y + 1][x + 1] != 1:
                    field_shots[y + 1][x + 1] = 0

        flooded = 0
        for ship in self.field_one_ships:
            flooded_parts = 0
            for x, y in ship:
                if self.field_one_shots[y][x] > 0:
                    flooded_parts += 1
            if flooded_parts == len(ship):
                flooded += 1
                for x, y in ship:
                    self.field_one_shots[y][x] = 2
                fill_area(self.field_one, self.field_one_shots, ship)
        self.field_one_flooded_ships = flooded

        flooded = 0
        for ship in self.field_two_ships:
            flooded_parts = 0
            for x, y in ship:
                if self.field_two_shots[y][x] > 0:
                    flooded_parts += 1
            if flooded_parts == len(ship):
                flooded += 1
                for x, y in ship:
                    self.field_two_shots[y][x] = 2
                fill_area(self.field_two, self.field_two_shots, ship)
        self.field_two_flooded_ships = flooded

        if self.field_one_flooded_ships == 10:
            self.winner = 2
            self.game_ended = True
        
        if self.field_two_flooded_ships == 10:
            self.winner = 1
            self.game_ended = True
        

    
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
        elif request["action"] == "get_games":
            res = []
            for id, game in enumerate(games):
                if (game.game_ended == False
                   and (not game.player_one_connected or not game.player_two_connected)):
                    res.append({"id": id, "connected": int(game.player_one_connected) + int(game.player_two_connected)})
            await websocket.send(success(res))
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
            
            if (len(games[game_id].field_one) != 0
                and len(games[game_id].field_two) != 0):
                games[game_id].find_ships()
            
        elif request["action"] == "get_turn":
            game_id = request["game_id"]
            await websocket.send(success( {
                "turn": games[game_id].turn,
                "game_ended": games[game_id].game_ended,
                "winner": games[game_id].winner
            }))

        elif request["action"] == "wait_enemy":
            game_id = request["game_id"]
            player = request["player"]

            if player == 1:
                while (len(games[game_id].field_two) == 0):
                    await asyncio.sleep(0.1)
                await websocket.send(success("OK"))
            elif player == 2:
                while (len(games[game_id].field_one) == 0):
                    await asyncio.sleep(0.1)
                await websocket.send(success("OK"))
            else:
                await websocket.send(error("Only two players in game"))

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
                # await websocket.send(success(1 if good_shot else 0))
                games[game_id].check_ships()
                if games[game_id].game_ended: good_shot = False
                await websocket.send(success( { "result": 1 if good_shot else 0, "shots": games[game_id].field_two_shots } ))
            elif player == 2 and games[game_id].turn == 2:
                good_shot = False
                if games[game_id].field_one[y][x] == 1:
                    good_shot = True
                
                if not good_shot: games[game_id].next_turn()

                games[game_id].field_one_shots[y][x] = 1 if good_shot else 0
                games[game_id].last_shot_time = int(time.time())
                # await websocket.send(success(1 if good_shot else 0))
                games[game_id].check_ships()
                if games[game_id].game_ended: good_shot = False
                await websocket.send(success( { "result": 1 if good_shot else 0, "shots": games[game_id].field_one_shots } ))
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
