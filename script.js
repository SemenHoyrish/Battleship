const FPS = 30;
// const FPS = 60;
// const FPS = 10;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const CANVAS = document.querySelector('canvas');
const BODY = document.querySelector('body');

BODY.style.width = WIDTH.toString() + "px";
BODY.style.height = HEIGHT.toString() + "px";




// game.createGameObject(40, 60, 200, 100);
// const btn = game.createButton(500, 500, 200, 100, "click me", () => {
//     game.createGameObject(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, "rgba(54, 168, 2, 0.3)");
//     console.log("clicked");
// }, 48, "#c4c4c4", "red");

// game.createText(500, 500, "HELLO", 48);

// game.removeGameObject(btn);

document.onkeydown = (e) => {
    if (e.code == "KeyQ") game.end();
}

let field = [
];

let playerFieldShots = [];
let enemyFieldShots = [];

for (let i = 0; i < 10; i++) {
    let row = [];
    for (let j = 0; j < 10; j++)
        row.push(0);
    field.push(row);
}
for (let i = 0; i < 10; i++) {
    let row = [];
    for (let j = 0; j < 10; j++)
        row.push(0);
    playerFieldShots.push(row);
}
for (let i = 0; i < 10; i++) {
    let row = [];
    for (let j = 0; j < 10; j++)
        row.push(0);
    enemyFieldShots.push(row);
}
// console.log(field);

let player = 0;
let playerTurn = false;

let game_id = 0;

const socket = new WebSocket('ws://localhost:8090');

socket.addEventListener('open', function (event) {
    socket.send( JSON.stringify({"action": 'create_game'}));
});

const States = {
    "error": -1,
    "connect": 0,
    "connecting": 1,
    // "sendField": 2,
    "getTurn": 3,
    "checkTurn": 4,
}
let state = States.connect;
const STATUS_SUCCESS = "success";
const STATUS_ERROR = "error";
socket.addEventListener('message', function (event) {
    let res = JSON.parse(event.data);
    console.log(state);
    console.log(res);
    if (res.status == STATUS_ERROR) {
        state = States.error;
        console.error("Server send ERROR!");
        return;
    }
    switch (state) {
        case States.connect:
            socket.send( JSON.stringify({
                "action": "connect",
                "game_id": game_id
            }));
            state = States.connecting;
            break;
        
        case States.connecting:
            player = res.message;
            fillField();
            // socket.send( JSON.stringify({
            //     "action": "send_field",
            //     "game_id": game_id,
            //     "player": player,
            //     "field": field
            // }));
            // state = States.getTurn;
            break;

        case States.getTurn:
            socket.send( JSON.stringify({
                "action": "get_turn",
                "game_id": game_id
            }));
            state = States.checkTurn;
            break;

        case States.checkTurn:
            const turn = res.message;
            if (turn == player) {
                playerTurn = true;
                state = States.waitShotResult;
            }
            else {
                playerTurn = false;
                state = States.waitShot;
            }
            break;

        case States.waitShotResult:
            if (res.message == 1) {
                enemyFieldShots[x][y] = 1;
                console.log("NS!");
                state = States.waitShotResult;
            } else {
                playerTurn = false;
                enemyFieldShots[x][y] = 0;
                console.log("MISS!");
                state = States.waitShot;
            }
            break;

        case States.waitShot:
            const x = res.message.x;
            const y = res.message.y;
            playerFieldShots[y][x] = field[y][x] == 1 ? 1 : 0;
            if (field[y][x] == 1) {
                state = States.waitShot;
            } else {
                state = States.waitShotResult;
                playerTurn = true;
            }
            break;
    
        default:
            break;
    }
    // let res = JSON.parse(event.data);
    // console.log(res);
    // if (res.status == "success") {
    //     console.log("_1");
    //     socket.send(JSON.stringify({
    //         "action": "send_field",
    //         "field": field,
    //         "id": 2,
    //         "player": 1
    //     }));
    // } else if (res.status == "error") {
    //     console.log("_2");
    //     console.log(res.message);
    //     // socket.send(JSON.stringify(field));
    // }
});





// field[3][5] = 1;
// field[4][5] = 1;
// field[7][5] = 1;
// field[3][7] = 1;

const COLORS = {
    "sea": "#00cbd6",
    "ship": "#3a3d38",
    "blocked": "#bdbdbd",
    "hover": "#c4c4c4",
    "preview": "#e38b59",
    "fire": "#db0707",
    "flooded": "#300000"
};
const CELL_SIZE = 50;

const fillField = () => {
    const game = initGame(WIDTH, HEIGHT, CANVAS, FPS);

    let frames = 0;

    const placeShip = (x, y, size, rotated=false) => {
        // if (field[y][x] != 0) return false;
    
        // field[y][x] = 1;
        
        // if (y - 1 >= 0 && field[y-1][x] == 0) field[y-1][x] = -1;
        // if (y + 1 < 10 && field[y+1][x] == 0) field[y+1][x] = -1;
        // if (x - 1 >= 0 && field[y][x-1] == 0) field[y][x-1] = -1;
        // if (x + 1 < 10 && field[y][x+1] == 0) field[y][x+1] = -1;
        // if (y - 1 >= 0 && x - 1 >= 0 && field[y-1][x-1] == 0) field[y-1][x-1] = -1;
        // if (y - 1 >= 0 && x + 1 < 10 && field[y-1][x+1] == 0) field[y-1][x+1] = -1;
        // if (y + 1 < 10 && x - 1 >= 0 && field[y+1][x-1] == 0) field[y+1][x-1] = -1;
        // if (y + 1 < 10 && x + 1 < 10 && field[y+1][x+1] == 0) field[y+1][x+1] = -1;
    
        clearShipPreviw();
    
        let free = true;

        console.log(shipsPlaced);

        if (size == 1 && shipsPlaced[1] >= 4) free = false;
        if (size == 2 && shipsPlaced[2] >= 3) free = false;
        if (size == 3 && shipsPlaced[3] >= 2) free = false;
        if (size == 4 && shipsPlaced[4] >= 1) free = false;

        for (let i = 0; i < size; i++) {
            if (!rotated) {
                if (!isCellFree(x + i, y)) free = false;
            } else {
                if (!isCellFree(x, y + i)) free = false;
            }
        }
    
        if (free) {
            for (let i = 0; i < size; i++) {
                if (!rotated) {
                    field[y][x + i] = 1;
                    if (isCellFree(x + i - 1, y)) field[y][x + i - 1] = -1;
                    if (isCellFree(x + i - 1, y - 1)) field[y - 1][x + i - 1] = -1;
                    if (isCellFree(x + i - 1, y + 1)) field[y + 1][x + i - 1] = -1;
                    if (isCellFree(x + i, y + 1)) field[y + 1][x + i] = -1;
                    if (isCellFree(x + i + 1, y + 1)) field[y + 1][x + i + 1] = -1;
                    if (isCellFree(x + i + 1, y - 1)) field[y - 1][x + i + 1] = -1;
                    if (isCellFree(x + i, y - 1)) field[y - 1][x + i] = -1;
                    if (i == size - 1 && isCellFree(x + i + 1, y)) field[y][x + i + 1] = -1;
                }
                else {
                    field[y + i][x] = 1;
                    if (isCellFree(x - 1, y + i)) field[y + i][x - 1] = -1;
                    if (isCellFree(x + 1, y + i)) field[y + i][x + 1] = -1;
                    if (isCellFree(x, y + i - 1)) field[y + i - 1][x] = -1;
                    if (isCellFree(x - 1, y + i - 1)) field[y + i - 1][x - 1] = -1;
                    if (isCellFree(x + 1, y + i - 1)) field[y + i - 1][x + 1] = -1;
                    if (isCellFree(x - 1, y + i + 1)) field[y + i + 1][x - 1] = -1;
                    if (isCellFree(x + 1, y + i + 1)) field[y + i + 1][x + 1] = -1;
    
                    if (i == size - 1 && isCellFree(x, y + i + 1)) field[y + i + 1][x] = -1;
                }
            }
            shipPreviewType = -1;
            shipsPlaced[size]++;
            return true;
        } else {
            return false;
        }
        
    
    };
    
    const isCellFree = (x, y) => {
        if (x < 0 || x >= 10 || y < 0 || y >= 10) return false;
        return field[y][x] == 0;
    }
    
    const shipPreview = (x, y, size, rotated=false) => {
        let free = true;
        for (let i = 0; i < size; i++) {
            if (!rotated) {
                if (!isCellFree(x + i, y)) free = false;
            } else {
                if (!isCellFree(x, y + i)) free = false;
            }
        }
    
        if (free) {
            for (let i = 0; i < size; i++) {
                if (!rotated)
                    field[y][x + i] = 2;
                else
                    field[y + i][x] = 2;
            }
            shipPreviewLast.x = x;
            shipPreviewLast.y = y;
            shipPreviewLast.size = size;
            shipPreviewLast.rotated = rotated;
        }
    };

    const clearShipPreviw = () => {
        if (shipPreviewLast == {}) return;
        x = shipPreviewLast.x;
        y = shipPreviewLast.y;
        size = shipPreviewLast.size;
        rotated = shipPreviewLast.rotated;
        for (let i = 0; i < size; i++) {
            if (!rotated)
                field[y][x + i] = 0;
            else
                field[y + i][x] = 0;
        }
        shipPreviewLast = {};
    }

    let shipPreviewLast = {};
    let shipPreviewType = -1;
    
    let shipRotated = false;

    let shipsPlaced = [0, 0, 0, 0, 0];
    
    let last_frame = 0;
    game.update = () => {
    
        game.removeAllGameObjects();
    
        let time = new Date().getTime() - last_frame;
        last_frame = new Date().getTime();
        
        game.createText(60, 10, "const FPS: " + FPS.toString());
        game.createText(180, 10, "actual FPS: " + (1000 / time).toFixed(2).toString());
        game.createText(320, 10, "FramesRendered: " + frames.toString());
        game.createText(480, 10, "{shipRotated}: " + shipRotated.toString());
    
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                let color = COLORS.sea;
                if (field[y][x] == 1) color = COLORS.ship;
                if (field[y][x] == -1) color = COLORS.blocked;
                if (field[y][x] == 2) color = COLORS.preview;
                const obj = game.createGameObject(CELL_SIZE + (CELL_SIZE + 1) * x, CELL_SIZE + (CELL_SIZE + 1) * y, CELL_SIZE, CELL_SIZE, color);
                game.createGameObjectClickHandler(obj, () => {
                    if (shipPreviewType != -1) placeShip(x, y, shipPreviewType, shipRotated);
                });
                if (field[y][x] != 1 && game.isMouseOverGameObject(obj)) {
                    if (shipPreviewType == -1)
                        obj.color = COLORS.hover;
                    else {
                        clearShipPreviw();
                        shipPreview(x, y, shipPreviewType, shipRotated);
                    }
                }
            }
        }
    
        const btns_offset = CELL_SIZE + (CELL_SIZE + 1) * 10 + 10;
        game.createButton(315, btns_offset, 180, 50, "ROTATE", () => {shipRotated = !shipRotated}, 30);
        game.createButton(315 + 150, btns_offset, 90, 50, "GO", () => {
            socket.send( JSON.stringify({
                "action": "send_field",
                "game_id": game_id,
                "player": player,
                "field": field
            }));
            state = States.getTurn;
            game.removeAllGameObjects();
            game.end();
            game.clearCanvas();
            return;
        }, 30);

        game.createButton(115, btns_offset, 180, 50, "SHIP 1X", () => {shipPreviewType = 1}, 30);
        game.createButton(115, btns_offset + 60, 180, 50, "SHIP 2X", () => {shipPreviewType = 2}, 30);
        game.createButton(115, btns_offset + 120, 180, 50, "SHIP 3X", () => {shipPreviewType = 3}, 30);
        game.createButton(115, btns_offset + 180, 180, 50, "SHIP 4X", () => {shipPreviewType = 4}, 30);
    
        if (!shipRotated) {
            game.createGameObject(315 - CELL_SIZE - 1, btns_offset + 60, CELL_SIZE, CELL_SIZE, COLORS.ship);
            game.createGameObject(315, btns_offset + 60, CELL_SIZE, CELL_SIZE, COLORS.ship);
            game.createGameObject(315 + CELL_SIZE + 1, btns_offset + 60, CELL_SIZE, CELL_SIZE, COLORS.ship);
        } else {
            game.createGameObject(315, btns_offset + 60, CELL_SIZE, CELL_SIZE, COLORS.ship);
            game.createGameObject(315, btns_offset + 60 + CELL_SIZE + 1, CELL_SIZE, CELL_SIZE, COLORS.ship);
            game.createGameObject(315, btns_offset + 60 + CELL_SIZE * 2 + 2, CELL_SIZE, CELL_SIZE, COLORS.ship);
        }
    
    
        frames++;
        // console.log("updated");
    }
};
