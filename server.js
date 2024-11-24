const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let players = {};
let choices = {};
let scores = { player1: 0, player2: 0 };

function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return "draw";
    if (
        (choice1 === "pedra" && choice2 === "tesoura") ||
        (choice1 === "tesoura" && choice2 === "papel") ||
        (choice1 === "papel" && choice2 === "pedra")
    ) {
        return "jogador1";
    }
    return "jogador2";
}

wss.on("connection", (ws) => {
    const playerId = Object.keys(players).length === 0 ? "jogador1" : "jogador2";
    players[playerId] = ws;

    ws.send(JSON.stringify({ type: "assign_id", id: playerId }));

    if (Object.keys(players).length === 2) {
        broadcast({ type: "update_status", message: "Ambos os jogadores conectados! Faça sua jogada." });
    }

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "make_choice") {
            choices[data.player] = data.choice;

            if (Object.keys(choices).length === 2) {
                const winner = determineWinner(choices.player1, choices.player2);

                if (winner === "draw") {
                    broadcast({ type: "update_status", message: "Empate!" });
                } else {
                    scores[winner]++;
                    broadcast({ type: "update_status", message: `${winner} venceu esta rodada!` });
                }

                broadcast({ type: "update_score", scores });
                choices = {};
                broadcast({ type: "enable_restart" });
            }
        }

        if (data.type === "restart") {
            broadcast({ type: "update_status", message: "Faça sua jogada." });
        }
    });

    ws.on("close", () => {
        players = {};
        choices = {};
        scores = { player1: 0, player2: 0 };
        broadcast({ type: "update_status", message: "Jogador desconectado. Reinicie o jogo." });
    });
});

function broadcast(data) {
    Object.values(players).forEach((player) => player.send(JSON.stringify(data)));
}
