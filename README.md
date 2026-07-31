# Genre Wordle

🎮 **[Click here to play the game live!](https://YOUR-USERNAME.github.io/genre-wordle)**

A custom, highly-polished spin on the classic Wordle game! Built entirely with HTML, CSS, and vanilla JavaScript. 

Instead of playing a random word every day, **Genre Wordle** lets you choose between different modes and play unlimited times. It comes packed with a sleek dark-mode UI, dynamic animations, and a competitive local leaderboard system.

## 🌟 Features
* **Genre Mode & Classic Mode**: Choose to guess words from specific categories (Technology, Animals, Food, Space) or stick to the classic Wordle dictionary.
* **Smart Dictionary Validation**: Integrated with the Free Dictionary API to prevent guessing fake words (e.g., "AAAAA" will be rejected).
* **Player Profiles**: Enter your name on the home screen to track your stats.
* **Dynamic Scoring**: Earn more points the faster you solve the puzzle (10 points for the 1st guess, down to 1 point for the 6th).
* **Competitive Leaderboard**: Compete with friends on the same device and see who can rack up the most points. 
* **Zero Duplicates**: The game uses `localStorage` to remember exactly which words you've already played, ensuring you never get the same puzzle twice until you've exhausted the entire dictionary.

## 🚀 How to Play
1. Enter your name on the Home Screen.
2. Select your game mode from the dropdown.
3. Click **Play Game**.
4. Guess the word within 6 tries. The color of the tiles will change to show how close your guess was to the word:
   * **Green**: The letter is in the word and in the correct spot.
   * **Gold**: The letter is in the word but in the wrong spot.
   * **Dark Gray**: The letter is not in the word in any spot.

## 🛠️ Built With
* **HTML5** & **CSS3** (Custom Animations, Grid Layouts, Radial Gradients)
* **Vanilla JavaScript** (ES6+)
* **Free Dictionary API** (https://dictionaryapi.dev)
