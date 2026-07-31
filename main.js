const wordsByGenre = {
    Technology: {
        5: ["MOUSE", "CACHE", "PIXEL", "MACRO", "PROXY", "BOARD", "DRIVE", "CLICK", "VIRUS", "DEBUG"],
        6: ["ROUTER", "SERVER", "CODING", "HACKER", "OBJECT", "SCREEN", "SYSTEM", "MEMORY", "KEYPAD", "KERNEL"]
    },
    Animals: {
        5: ["TIGER", "PANDA", "WHALE", "SNAKE", "EAGLE", "MOOSE", "SLOTH", "RHINO", "HIPPO", "ZEBRA"],
        6: ["MONKEY", "RABBIT", "LIZARD", "TURTLE", "PARROT", "JAGUAR", "WALRUS", "BADGER", "DONKEY", "IGUANA"]
    },
    Food: {
        5: ["PIZZA", "BREAD", "APPLE", "SUSHI", "LEMON", "BACON", "PASTA", "STEAK", "DONUT", "SYRUP"],
        6: ["CHEESE", "TOMATO", "GARLIC", "PEPPER", "ONIONS", "BUTTER", "CARROT", "POTATO", "WAFFLE", "ALMOND"]
    },
    Space: {
        5: ["ALIEN", "COMET", "ORBIT", "VENUS", "EARTH", "LUNAR", "SOLAR", "STARS", "SPACE", "BLACK"],
        6: ["PLANET", "GALAXY", "ROCKET", "METEOR", "COSMOS", "APOLLO", "NEBULA", "PULSAR", "QUASAR", "ZODIAC"]
    }
};

const classicWords = {
    5: ["SMART", "BRAIN", "PLANT", "WATER", "GHOST", "TRAIN", "HOUSE", "LIGHT", "DREAM", "MUSIC", "PAPER", "CHAIR", "CLOCK", "TABLE", "PAINT"],
    6: ["GUITAR", "PENCIL", "BOTTLE", "CAMERA", "WINTER", "SUMMER", "SPRING", "AUTUMN", "FOREST", "RIVER", "WINDOW", "MIRROR", "POCKET", "BUTTON"]
};

function getRandomWord(mode = 'genre') {
    let playedWords = [];
    try {
        const stored = localStorage.getItem('playedWordleWords');
        if (stored) playedWords = JSON.parse(stored);
    } catch (e) {
        console.error("Could not parse played words from localStorage");
    }

    const availableWords = [];
    
    if (mode === 'genre') {
        for (const genre in wordsByGenre) {
            for (const length in wordsByGenre[genre]) {
                for (const word of wordsByGenre[genre][length]) {
                    if (!playedWords.includes(word)) {
                        availableWords.push({
                            word: word,
                            genre: genre,
                            length: parseInt(length, 10)
                        });
                    }
                }
            }
        }
    } else {
        // Classic mode
        for (const length in classicWords) {
            for (const word of classicWords[length]) {
                if (!playedWords.includes(word)) {
                    availableWords.push({
                        word: word,
                        genre: "Classic",
                        length: parseInt(length, 10)
                    });
                }
            }
        }
    }

    if (availableWords.length === 0) {
        alert("Wow! You've played every single word in this mode. Resetting your progress.");
        localStorage.removeItem('playedWordleWords');
        return getRandomWord(mode); // recursive call after reset
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    return availableWords[randomIndex];
}

function markWordAsPlayed(word) {
    let playedWords = [];
    try {
        const stored = localStorage.getItem('playedWordleWords');
        if (stored) playedWords = JSON.parse(stored);
    } catch (e) {
        // ignore
    }
    
    if (!playedWords.includes(word)) {
        playedWords.push(word);
        localStorage.setItem('playedWordleWords', JSON.stringify(playedWords));
    }
}

let WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

let currentWord = "";
let validDictionary = new Set();
let isDictionaryLoaded = false;

// Fetch full dictionary
fetch('https://cdn.jsdelivr.net/gh/dwyl/english-words@master/words_alpha.txt')
    .then(res => res.text())
    .then(text => {
        text.split(/\r?\n/).forEach(w => {
            const word = w.trim().toUpperCase();
            if (word.length === 5 || word.length === 6) {
                validDictionary.add(word);
            }
        });
        isDictionaryLoaded = true;
    })
    .catch(e => {
        console.error("Could not load dictionary", e);
        isDictionaryLoaded = true; 
    });

let currentGenre = "";
let guesses = [];
let currentGuess = "";
let gameOver = false;
let currentRow = 0;

const board = document.getElementById("game-board");
const keyboard = document.getElementById("keyboard-container");
const messageContainer = document.getElementById("message-container");
const genreDisplay = document.getElementById("current-genre");
const modal = document.getElementById("end-modal");
const playAgainBtn = document.getElementById("play-again-btn");

function initGame() {
    const modeSelector = document.getElementById("home-mode-selector");
    const mode = modeSelector ? modeSelector.value : 'genre';
    const randomData = getRandomWord(mode);
    currentWord = randomData.word;
    currentGenre = randomData.genre;
    WORD_LENGTH = randomData.length;
    
    genreDisplay.textContent = currentGenre;
    
    guesses = Array.from({ length: 6 }, () => "");
    currentGuess = "";
    gameOver = false;
    currentRow = 0;
    
    modal.classList.add("hidden");
    
    buildBoard();
    resetKeyboard();
}

function buildBoard() {
    board.innerHTML = "";
    // Let the rows handle the columns, we don't set gridTemplateColumns on the board itself.
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement("div");
        row.className = "board-row";
        row.style.gridTemplateColumns = `repeat(${WORD_LENGTH}, 1fr)`;
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.setAttribute("id", `tile-${i}-${j}`);
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function resetKeyboard() {
    const keys = keyboard.querySelectorAll("button");
    keys.forEach(key => {
        key.classList.remove("correct", "present", "absent");
    });
}

function showMessage(msg, duration = 2000) {
    const messageEl = document.createElement("div");
    messageEl.textContent = msg;
    messageEl.className = "message";
    messageContainer.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.classList.add("fade-out");
        setTimeout(() => {
            messageContainer.removeChild(messageEl);
        }, 300);
    }, duration);
}

let isChecking = false;

function handleKeyPress(key) {
    if (gameOver || isChecking) return;

    if (key === "ENTER") {
        submitGuess();
        return;
    }

    if (key === "BACKSPACE" || key === "DELETE") {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        }
        return;
    }

    if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
            currentGuess += key;
            updateBoard(true); // animate last tile
        }
    }
}

function updateBoard(animateLast = false) {
    const row = board.children[currentRow];
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = row.children[i];
        tile.textContent = currentGuess[i] || "";
        
        if (currentGuess[i]) {
            tile.classList.add("filled");
            if (animateLast && i === currentGuess.length - 1) {
                // remove and re-add class to restart animation
                tile.style.animation = 'none';
                tile.offsetHeight; /* trigger reflow */
                tile.style.animation = null; 
            }
        } else {
            tile.classList.remove("filled");
        }
    }
}

async function submitGuess() {
    if (isChecking) return;
    
    if (currentGuess.length !== WORD_LENGTH) {
        showMessage("Not enough letters");
        shakeRow(currentRow);
        return;
    }

    const guess = currentGuess;
    const upperGuess = guess.toUpperCase();
    isChecking = true;
    
    const row = board.children[currentRow];
    row.style.opacity = '0.6'; // Immediate visual feedback
    
    let isValid = false;
    
    // Check internal dictionaries first
    for (const genre in wordsByGenre) {
        for (const len in wordsByGenre[genre]) {
            if (wordsByGenre[genre][len].map(w => w.toUpperCase()).includes(upperGuess)) {
                isValid = true;
            }
        }
    }
    for (const len in classicWords) {
        if (classicWords[len].map(w => w.toUpperCase()).includes(upperGuess)) {
            isValid = true;
        }
    }
    
    // Check pre-loaded full dictionary
    if (!isValid) {
        if (!isDictionaryLoaded) {
            showMessage("Loading dictionary, please wait a second...");
            isChecking = false;
            row.style.opacity = '1';
            return;
        }
        
        if (validDictionary.has(upperGuess)) {
            isValid = true;
        } else {
            // Also accept if validDictionary is somehow empty (fallback)
            if (validDictionary.size === 0 && isDictionaryLoaded) {
                isValid = true;
            }
        }
    }

    isChecking = false;
    row.style.opacity = '1';

    if (!isValid) {
        showMessage("Not in word list");
        shakeRow(currentRow);
        return;
    }
    
    guesses[currentRow] = guess;
    checkGuess(guess, currentRow);
}

function checkGuess(guess, rowIdx) {
    const row = board.children[rowIdx];
    const targetLetters = currentWord.split("");
    const guessLetters = guess.split("");
    
    const tileStates = Array(WORD_LENGTH).fill("absent");
    
    // First pass: Find exact matches
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            tileStates[i] = "correct";
            targetLetters[i] = null; // consume letter
            guessLetters[i] = null;
        }
    }
    
    // Second pass: Find present matches
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] !== null) {
            const targetIndex = targetLetters.indexOf(guessLetters[i]);
            if (targetIndex !== -1) {
                tileStates[i] = "present";
                targetLetters[targetIndex] = null; // consume letter
            }
        }
    }

    // Animate tiles
    guess.split("").forEach((letter, i) => {
        setTimeout(() => {
            const tile = row.children[i];
            tile.classList.add("flip");
            
            setTimeout(() => {
                tile.classList.add(tileStates[i]);
                tile.style.borderColor = "var(--border-color)"; // Let CSS classes handle background/border
                updateKeyboard(letter, tileStates[i]);
            }, FLIP_ANIMATION_DURATION / 2);
            
        }, (i * FLIP_ANIMATION_DURATION) / 2);
    });

    const totalAnimationTime = (WORD_LENGTH * FLIP_ANIMATION_DURATION) / 2;
    
    setTimeout(() => {
        if (guess === currentWord) {
            handleWin();
        } else if (currentRow === 5) {
            handleLoss();
        } else {
            currentRow++;
            currentGuess = "";
        }
    }, totalAnimationTime + 100);
}

function updateKeyboard(letter, state) {
    const keyBtn = document.querySelector(`button[data-key="${letter}"]`);
    if (!keyBtn) return;
    
    // correct overrides present, present overrides absent
    if (state === "correct") {
        keyBtn.classList.remove("present", "absent");
        keyBtn.classList.add("correct");
    } else if (state === "present" && !keyBtn.classList.contains("correct")) {
        keyBtn.classList.remove("absent");
        keyBtn.classList.add("present");
    } else if (state === "absent" && !keyBtn.classList.contains("correct") && !keyBtn.classList.contains("present")) {
        keyBtn.classList.add("absent");
    }
}

function shakeRow(rowIdx) {
    const row = board.children[rowIdx];
    for (let i = 0; i < WORD_LENGTH; i++) {
        row.children[i].classList.remove("shake");
        void row.children[i].offsetWidth; // trigger reflow
        row.children[i].classList.add("shake");
    }
}

let currentUser = "Guest";

function loadScores() {
    const data = localStorage.getItem("wordleLeaderboard");
    return data ? JSON.parse(data) : {};
}

function saveScores(scores) {
    localStorage.setItem("wordleLeaderboard", JSON.stringify(scores));
}

function addScoreToUser(name, points) {
    if (!name) name = "Guest";
    const scores = loadScores();
    scores[name] = (scores[name] || 0) + points;
    saveScores(scores);
}

function getScore(name) {
    if (!name) name = "Guest";
    const scores = loadScores();
    return scores[name] || 0;
}

function handleWin() {
    gameOver = true;
    markWordAsPlayed(currentWord);
    
    const points = [10, 8, 6, 4, 2, 1][currentRow];
    addScoreToUser(currentUser, points);
    document.getElementById("player-score-display").textContent = getScore(currentUser);
    
    showMessage("Magnificent!", 3000);
    setTimeout(() => showEndModal(true, points), 2000);
}

function handleLoss() {
    gameOver = true;
    markWordAsPlayed(currentWord);
    showMessage(currentWord, 5000);
    setTimeout(() => showEndModal(false), 2000);
}

function showEndModal(win, points = 0) {
    document.getElementById("modal-title").textContent = win ? "You Won!" : "Game Over";
    document.getElementById("modal-message").textContent = win ? `You earned ${points} points! The word was ${currentWord}` : `The word was ${currentWord}`;
    modal.classList.remove("hidden");
}

// Event Listeners
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    let key = e.key.toUpperCase();
    if (key === "BACKSPACE" || key === "ENTER" || /^[A-Z]$/.test(key)) {
        handleKeyPress(key);
    }
});

keyboard.addEventListener("click", (e) => {
    const target = e.target.closest('button');
    if (target && target.dataset.key) {
        handleKeyPress(target.dataset.key);
    }
});

playAgainBtn.addEventListener("click", () => {
    initGame();
});

const homeScreen = document.getElementById("home-screen");
const gameUi = document.getElementById("game-ui");
const startGameBtn = document.getElementById("start-game-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");
const leaderboardList = document.getElementById("leaderboard-list");
const endHomeBtn = document.getElementById("end-home-btn");

if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
        const nameInput = document.getElementById("player-name-input").value.trim();
        currentUser = nameInput || "Guest";
        
        document.getElementById("player-name-display").textContent = currentUser;
        document.getElementById("player-score-display").textContent = getScore(currentUser);
        
        homeScreen.classList.add("hidden");
        gameUi.classList.remove("hidden");
        initGame();
    });
}

if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", () => {
        const scores = loadScores();
        const sortedScores = Object.entries(scores)
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score);
        
        leaderboardList.innerHTML = "";
        if (sortedScores.length === 0) {
            leaderboardList.innerHTML = "<li>No scores yet. Play a game!</li>";
        } else {
            sortedScores.forEach(entry => {
                const li = document.createElement("li");
                li.innerHTML = `<span class="lb-name">${entry.name}</span> <span class="lb-score">${entry.score} pts</span>`;
                leaderboardList.appendChild(li);
            });
        }
        
        leaderboardModal.classList.remove("hidden");
    });
}

if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener("click", () => {
        leaderboardModal.classList.add("hidden");
    });
}

if (endHomeBtn) {
    endHomeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        gameUi.classList.add("hidden");
        homeScreen.classList.remove("hidden");
        if (currentUser !== "Guest") {
            document.getElementById("player-name-input").value = currentUser;
        }
    });
}
