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

/**
 * Gets a random unplayed word of a random length (5 or 6).
 * mode can be 'genre' or 'classic'
 */
export function getRandomWord(mode = 'genre') {
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

export function markWordAsPlayed(word) {
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
