
const main = () => {
    const create_game = document.querySelector(".create_game");
    const games = document.querySelector(".games");

    socket = new WebSocket('ws://localhost:8090');

    socket.addEventListener('open', function (event) {
        // socket.send( JSON.stringify({"action": 'create_game'}));
        socket.send( JSON.stringify({"action": "get_games"}));
    });

    socket.addEventListener('message', function (event) {
        const res = JSON.parse(event.data).message;
        console.log(res);
        for(let i = 0; i < res.length; i++) {
            games.innerHTML += `
            <div class="game">
                <p>Players connected: ${res[i].connected}/2</p>
                <a href="./game.html#game_id=${res[i].id}">Connect</a>
            </div>
            `;
        }
    });

    create_game.addEventListener("click", () => {
        socket.send( JSON.stringify({"action": 'create_game'}));
        location.reload();
    });

};

main();
