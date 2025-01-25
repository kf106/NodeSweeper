// Used to randomly place mines on the board

// Function to create the initial game board with mines placed randomly
function createBoard(rows, cols, mines) {
    let board = Array.from({ length: rows }, () => Array(cols).fill(' ')); // Initialize a blank board
    let minePositions = new Set(); // Set to keep track of mine locations

    while (minePositions.size < mines) { // Loop until all mines are placed
        let row = Math.floor(Math.random() * rows);
        let col = Math.floor(Math.random() * cols);
        let pos = `${row},${col}`;
        if (!minePositions.has(pos)) { // Check if the cell is already a mine
            minePositions.add(pos); // Add the mine position to the set
            board[row][col] = '💣'; // Place a bomb emoji in the cell
        }
    }

    for (let row = 0; row < rows; row++) { // Loop through every cell in the board
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== '💣') { // If the cell is not a mine
                board[row][col] = countAdjacentMines(board, row, col).toString(); // Count adjacent mines
            }
        }
    }

    return { board, minePositions }; // Return the completed board and mine positions
}

// Function to count the number of adjacent mines for a given cell
function countAdjacentMines(board, row, col) {
    let count = 0; // Initialize mine count to 0
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]; // All adjacent directions

    for (const [dr, dc] of directions) { // Loop through each direction
        let nr = row + dr, nc = col + dc; // Calculate the neighboring cell coordinates
        if (
            nr >= 0 && nr < board.length &&
            nc >= 0 && nc < board[0].length &&
            board[nr][nc] === '💣'
        ) { // Check if neighbor is a mine
            count += 1; // Increment mine count
        }
    }

    return count; // Return the total number of adjacent mines
}

// Function to reveal cells on the board
function revealBoard(board, visibleBoard, row, col) {
    if (visibleBoard[row][col] !== ' ') { // If the cell is already revealed, do nothing
        return;
    }

    visibleBoard[row][col] = board[row][col]; // Reveal the cell

    if (board[row][col] === '0') { // If the cell is blank ('0')
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1], [1, 0], [1, 1]
        ]; // All adjacent directions

        for (const [dr, dc] of directions) { // Loop through each direction
            let nr = row + dr, nc = col + dc; // Calculate the neighboring cell coordinates
            if (
                nr >= 0 && nr < board.length &&
                nc >= 0 && nc < board[0].length &&
                visibleBoard[nr][nc] === ' '
            ) { // If neighbor is unrevealed
                revealBoard(board, visibleBoard, nr, nc); // Recursively reveal the neighboring cell
            }
        }
    }
}

// Initialize flag tracking and game over state
let flagPositions = new Set(); // Default value is an empty set; tracks the positions of flagged cells
let gameOver = false; // Default value is False; tracks whether the game has ended

let board, minePositions, visibleBoard, buttons, statusLabel, rows, cols, root;

// Function to handle button clicks in the GUI
function onClick(row, col) {
    if (gameOver) { // If the game is over, ignore clicks
        return;
    }

    if (visibleBoard[row][col] !== ' ') { // If the cell is already revealed, trigger surrounding reveal
        revealAroundNumber(row, col);
        return;
    }

    let pos = `${row},${col}`;
    if (minePositions.has(pos)) { // If the clicked cell is a mine
        revealAllMines(); // Reveal all mines
        statusLabel.textContent = "Game Over! You hit a mine."; // Display game over message
        gameOver = true; // Set game over state
        showRestartButton(); // Show restart button
        return;
    }

    revealBoard(board, visibleBoard, row, col); // Reveal the clicked cell
    updateButtons(); // Update the button states
    checkWinCondition(); // Check if the player has won
}

// Function to check if the player has won
function checkWinCondition() {
    // Check if all non-mine cells are revealed
    let allNonMinesRevealed = true;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let pos = `${r},${c}`;
            if (!minePositions.has(pos) && visibleBoard[r][c] === ' ') {
                allNonMinesRevealed = false;
                break;
            }
        }
        if (!allNonMinesRevealed) break;
    }

    // Check if all mines are flagged correctly
    let allMinesFlagged = true;
    for (let pos of minePositions) {
        if (!flagPositions.has(pos)) {
            allMinesFlagged = false;
            break;
        }
    }
    if (flagPositions.size !== minePositions.size) {
        allMinesFlagged = false;
    }

    // Declare win if either condition is met
    if (allNonMinesRevealed || allMinesFlagged) {
        statusLabel.textContent = "Congratulations! You've cleared the board."; // Display win message
        gameOver = true; // Set game over state
        showRestartButton(); // Show restart button
    }
}

// Function to handle right-clicks (flagging mines)
function onRightClick(event, row, col) {
    event.preventDefault(); // Prevent the default context menu

    if (gameOver) { // If the game is over, ignore clicks
        return;
    }

    let pos = `${row},${col}`;
    if (!flagPositions.has(pos)) { // If the cell is not flagged
        buttons[row][col].textContent = '🚩'; // Add a flag
        buttons[row][col].style.color = 'red';
        flagPositions.add(pos); // Add the cell to flagged positions
        checkWinCondition(); // Check if the player has won
    } else { // If the cell is already flagged
        buttons[row][col].textContent = ' ';
        buttons[row][col].style.color = 'black';
        flagPositions.delete(pos); // Remove the cell from flagged positions
        checkWinCondition(); // Check if the player has won
    }
}

// Update the button labels to reflect revealed cells with colors
function updateButtons() {
    const bgColor = '#d1d1d1'; // Default value is light gray; used for revealed cells
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (visibleBoard[r][c] !== ' ') { // If the cell is revealed
                let fgColor = visibleBoard[r][c] === '0' ? 'gray' : 'blue'; // Choose font color
                buttons[r][c].textContent = visibleBoard[r][c];
                buttons[r][c].disabled = true;
                buttons[r][c].style.color = fgColor;
                buttons[r][c].style.backgroundColor = bgColor;
            }
        }
    }
}

// Reveal all mines on the board
function revealAllMines() {
    for (let pos of minePositions) { // Loop through all mine positions
        let [r, c] = pos.split(',').map(Number);
        if (flagPositions.has(pos)) { // If the mine is flagged
            buttons[r][c].textContent = '🚩'; // Mark correctly flagged mines in green
            buttons[r][c].style.color = 'green';
        } else { // If the mine is not flagged
            buttons[r][c].textContent = '💣'; // Show unflagged mines in red
            buttons[r][c].style.color = 'red';
            buttons[r][c].disabled = true;
        }
    }
}

// Function to reveal surrounding cells when clicking on a revealed cell
function revealAroundNumber(row, col) {
    if (gameOver) { // If the game is over, ignore clicks
        return;
    }
    if (isDigit(visibleBoard[row][col]) && visibleBoard[row][col] !== '0') { // If the cell is a number
        let hitMine = false;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1], [1, 0], [1, 1]
        ]; // All adjacent directions

        for (const [dr, dc] of directions) { // Loop through each direction
            let nr = row + dr, nc = col + dc; // Calculate the neighboring cell coordinates
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) { // Check if the neighbor is within board boundaries
                if (visibleBoard[nr][nc] !== ' ') { // If the neighbor is already revealed, skip
                    continue;
                }
                let pos = `${nr},${nc}`;
                if (flagPositions.has(pos)) { // If the neighbor is flagged, skip
                    continue;
                }
                if (minePositions.has(pos)) { // If the neighbor is a mine
                    hitMine = true; // Set hit mine flag
                }
                revealBoard(board, visibleBoard, nr, nc); // If not revealed, reveal the neighbor
            }
        }
        updateButtons(); // Update the button states

        if (hitMine && !gameOver) { // If a mine was hit
            revealAllMines(); // Reveal all mines
            statusLabel.textContent = "Game Over! You hit a mine."; // Display game over message
            gameOver = true; // Set game over state
            showRestartButton(); // Show restart button
        }
    }
}

// Helper function to check if a string is a digit
function isDigit(str) {
    return /^\d+$/.test(str);
}

// Show restart button after game over
function showRestartButton() {
    let restartButton = document.createElement('button'); // Create restart button
    restartButton.textContent = "Restart"; // Set button text
    restartButton.onclick = restartGame; // Set click handler
    restartButton.style.marginTop = '10px';
    root.appendChild(restartButton); // Append the restart button to the root
}

// Restart the game
function restartGame() {
    root.innerHTML = ''; // Clear the current game window
    chooseDifficulty(); // Return to the difficulty selection screen
}

// Function to choose difficulty and start the game
function chooseDifficulty() {
    function startGame(size, mines) {
        root.innerHTML = ''; // Clear the difficulty selection window
        playPisweeper(size, mines); // Start the game with selected parameters
    }

    root = document.createElement('div'); // Create the difficulty selection container
    root.style.textAlign = 'center';
    root.style.marginTop = '50px';
    document.body.appendChild(root); // Append to body

    let title = document.createElement('h2');
    title.textContent = "Select Difficulty:";
    root.appendChild(title); // Add a label prompting difficulty selection

    let beginnerButton = document.createElement('button');
    beginnerButton.textContent = "Beginner (8x8, 10 mines)";
    beginnerButton.style.display = 'block';
    beginnerButton.style.margin = '10px auto';
    beginnerButton.onclick = () => startGame([8, 8], 10);
    root.appendChild(beginnerButton); // Beginner level

    let intermediateButton = document.createElement('button');
    intermediateButton.textContent = "Intermediate (16x16, 40 mines)";
    intermediateButton.style.display = 'block';
    intermediateButton.style.margin = '10px auto';
    intermediateButton.onclick = () => startGame([16, 16], 40);
    root.appendChild(intermediateButton); // Intermediate level

    let expertButton = document.createElement('button');
    expertButton.textContent = "Expert (30x16, 99 mines)";
    expertButton.style.display = 'block';
    expertButton.style.margin = '10px auto';
    expertButton.onclick = () => startGame([16, 30], 99);
    root.appendChild(expertButton); // Expert level
}

// Initialize the pisweeper game in a GUI
function playPisweeper(boardSize, mines) {
    [rows, cols] = boardSize; // Extract rows and columns from the board size tuple
    gameOver = false; // Reset the game state
    const result = createBoard(rows, cols, mines); // Generate the board and place mines
    board = result.board;
    minePositions = result.minePositions;
    visibleBoard = Array.from({ length: rows }, () => Array(cols).fill(' ')); // Create the visible board (all cells unrevealed)

    root.innerHTML = ''; // Clear the root container
    root.style.textAlign = 'center';

    // Create grid container
    let grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateRows = `repeat(${rows}, 40px)`;
    grid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    grid.style.gap = '2px';
    root.appendChild(grid); // Append grid to root

    buttons = Array.from({ length: rows }, () => Array(cols).fill(null)); // Create a grid for the buttons

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let btn = document.createElement('button');
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.fontSize = '18px';
            btn.style.cursor = 'pointer';
            btn.textContent = ' ';
            btn.addEventListener('click', () => onClick(r, c)); // Left-click binding
            btn.addEventListener('contextmenu', (e) => onRightClick(e, r, c)); // Right-click binding
            grid.appendChild(btn); // Place the button in the grid
            buttons[r][c] = btn;
        }
    }

    // Add a status label below the board
    statusLabel = document.createElement('div');
    statusLabel.textContent = "Good luck!"; // Initial message
    statusLabel.style.marginTop = '10px';
    root.appendChild(statusLabel); // Position the label
}

// Start the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    chooseDifficulty(); // Start the difficulty selection
});
