const FPS = 30;
// const FPS = 60;
// const FPS = 10;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const CANVAS = document.querySelector('canvas');
const BODY = document.querySelector('body');

BODY.style.width = WIDTH.toString() + "px";
BODY.style.height = HEIGHT.toString() + "px";


const game = initGame(WIDTH, HEIGHT, CANVAS, FPS);

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

for (let i = 0; i < 10; i++) {
    let row = [];
    for (let j = 0; j < 10; j++)
        row.push(0);
    field.push(row);
}
// console.log(field);


// field[3][5] = 1;
// field[4][5] = 1;
// field[7][5] = 1;
// field[3][7] = 1;

colors = {
    "sea": "#00cbd6",
    "ship": "#3a3d38",
    "blocked": "#bdbdbd",
    "hover": "#c4c4c4",
    "preview": "#e38b59",
    "fire": "#db0707",
    "flooded": "#300000"
};
const CELL_SIZE = 50;

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
            let color = colors.sea;
            if (field[y][x] == 1) color = colors.ship;
            if (field[y][x] == -1) color = colors.blocked;
            if (field[y][x] == 2) color = colors.preview;
            const obj = game.createGameObject(CELL_SIZE + (CELL_SIZE + 1) * x, CELL_SIZE + (CELL_SIZE + 1) * y, CELL_SIZE, CELL_SIZE, color);
            game.createGameObjectClickHandler(obj, () => {
                if (shipPreviewType != -1) placeShip(x, y, shipPreviewType, shipRotated);
            });
            if (field[y][x] != 1 && game.isMouseOverGameObject(obj)) {
                if (shipPreviewType == -1)
                    obj.color = colors.hover;
                else {
                    clearShipPreviw();
                    shipPreview(x, y, shipPreviewType, shipRotated);
                }
            }
        }
    }

    const btns_offset = CELL_SIZE + (CELL_SIZE + 1) * 10 + 10;
    game.createButton(315, btns_offset, 180, 50, "ROTATE", () => {shipRotated = !shipRotated}, 30);
    game.createButton(115, btns_offset, 180, 50, "SHIP 1X", () => {shipPreviewType = 1}, 30);
    game.createButton(115, btns_offset + 60, 180, 50, "SHIP 2X", () => {shipPreviewType = 2}, 30);
    game.createButton(115, btns_offset + 120, 180, 50, "SHIP 3X", () => {shipPreviewType = 3}, 30);
    game.createButton(115, btns_offset + 180, 180, 50, "SHIP 4X", () => {shipPreviewType = 4}, 30);

    if (!shipRotated) {
        game.createGameObject(315 - CELL_SIZE - 1, btns_offset + 60, CELL_SIZE, CELL_SIZE, colors.ship);
        game.createGameObject(315, btns_offset + 60, CELL_SIZE, CELL_SIZE, colors.ship);
        game.createGameObject(315 + CELL_SIZE + 1, btns_offset + 60, CELL_SIZE, CELL_SIZE, colors.ship);
    } else {
        game.createGameObject(315, btns_offset + 60, CELL_SIZE, CELL_SIZE, colors.ship);
        game.createGameObject(315, btns_offset + 60 + CELL_SIZE + 1, CELL_SIZE, CELL_SIZE, colors.ship);
        game.createGameObject(315, btns_offset + 60 + CELL_SIZE * 2 + 2, CELL_SIZE, CELL_SIZE, colors.ship);
    }


    frames++;
    // console.log("updated");
}


// let prev_time = 0;
// let i = 0;
// let prev_obj;
// game.update = () => {

//     if (new Date().getTime() - prev_time > 200) {
//         console.log("HELLO");
//         i++;
//         game.removeGameObject(prev_obj);
//         prev_obj = game.createGameObject(100 + 10 * i, 100 + 10 * i, 100, 100, "#c4c4c4");

//         if (10 * i > WIDTH || 10 * i > HEIGHT) i = 0;

//         prev_time = new Date().getTime();
//     }

// }

//game.end();
