const socket = new WebSocket("ws://localhost:8080");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const choicesEl = document.getElementById("choices");
const restartBtn = document.getElementById("restart");

let playerId = null;
let playerChoice = null;
let scores = { jogador1: 0, jogador2: 0 };

socket.onopen = () => {
    statusEl.textContent = "Conectado. Aguardando outro jogador...";
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "assign_id") {
        playerId = data.id;
        statusEl.textContent = `Você é o ${playerId === "player1" ? "Jogador 1" : "Jogador 2"}`;
    }

    if (data.type === "update_status") {
        statusEl.textContent = data.message;
    }

    if (data.type === "update_score") {
        scores = data.scores;
        scoreEl.textContent = `Placar: Jogador 1: ${scores.player1} | Jogador 2: ${scores.player2}`;
    }

    if (data.type === "enable_restart") {
        restartBtn.style.display = "block";
    }
};

choicesEl.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        playerChoice = event.target.dataset.choice;
        socket.send(JSON.stringify({ type: "make_choice", player: playerId, choice: playerChoice }));
        statusEl.textContent = "Aguardando outro jogador...";
        choicesEl.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
    }
});

restartBtn.addEventListener("click", () => {
    socket.send(JSON.stringify({ type: "restart" }));
    restartBtn.style.display = "none";
    choicesEl.querySelectorAll("button").forEach((btn) => (btn.disabled = false));
});
