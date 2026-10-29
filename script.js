let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let gameMode = "pvp";
let scores = { X: 0, O: 0, draw: 0 };

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect");
const themeSelect = document.getElementById("themeSelect");
const oTitle = document.getElementById("oTitle");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const canvas = document.getElementById("winning-canvas");
const ctx = canvas.getContext("2d");

function playSound(freq, duration) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function resizeCanvas() {
    const wrapper = document.querySelector('.board-wrapper');
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute("data-index"));

    if (boardState[clickedIndex] !== "" || !isGameActive) return;

    makeMove(clickedIndex, currentPlayer);

    if (isGameActive && gameMode === "ai" && currentPlayer === "O") {
        setTimeout(makeAIMove, 350);
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase());
    
    playSound(player === 'X' ? 400 : 320, 0.08);
    checkResult();
}

function makeAIMove() {
    if (!isGameActive) return;

    let move = findBestMove("O");
    if (move === null) move = findBestMove("X");
    if (move === null && boardState[4] === "") move = 4;

    if (move === null) {
        const emptyIndices = boardState
            .map((val, idx) => val === "" ? idx : null)
            .filter(val => val !== null);
        move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (move !== undefined && move !== null) {
        makeMove(move, "O");
    }
}

function findBestMove(player) {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        const values = [boardState[a], boardState[b], boardState[c]];
        if (values.filter(v => v === player).length === 2 && values.includes("")) {
            return combo[values.indexOf("")];
        }
    }
    return null;
}

function checkResult() {
    let roundWon = false;
    let winningCombo = null;

    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            winningCombo = winningCombinations[i];
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `Pemain ${currentPlayer} Memenangkan Permainan`;
        isGameActive = false;
        scores[currentPlayer]++;
        updateScores();
        drawWinningLine(winningCombo);
        playSound(520, 0.2);
        return;
    }

    if (!boardState.includes("")) {
        statusText.innerText = "Permainan Berakhir Seri";
        isGameActive = false;
        scores.draw++;
        updateScores();
        playSound(220, 0.2);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = (gameMode === "ai" && currentPlayer === "O") 
        ? "Komputer Sedang Berpikir..." 
        : `Giliran Pemain ${currentPlayer}`;
}

function drawWinningLine(combo) {
    const startCell = cells[combo[0]].getBoundingClientRect();
    const endCell = cells[combo[2]].getBoundingClientRect();
    const boardRect = document.getElementById("board").getBoundingClientRect();

    const startX = startCell.left + startCell.width / 2 - boardRect.left;
    const startY = startCell.top + startCell.height / 2 - boardRect.top;
    const endX = endCell.left + endCell.width / 2 - boardRect.left;
    const endY = endCell.top + endCell.height / 2 - boardRect.top;

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

    ctx.strokeStyle = accentColor || "#d47a8f";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function updateScores() {
    scoreX.innerText = scores.X;
    scoreO.innerText = scores.O;
    scoreDraw.innerText = scores.draw;
}

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusText.innerText = "Giliran Pemain X";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove("x", "o");
    });

    // Skor ikut tereset kembali ke 0
    scores = { X: 0, O: 0, draw: 0 };
    updateScores();
}

cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);

modeSelect.addEventListener("change", (e) => {
    gameMode = e.target.value;
    oTitle.innerText = gameMode === "ai" ? "Komputer" : "Pemain O";
    resetGame();
});

themeSelect.addEventListener("change", (e) => {
    const theme = e.target.value;
    if (theme === "pastel") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
});