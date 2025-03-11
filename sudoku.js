const linkElement = document.createElement('link');

linkElement.rel = 'stylesheet';
linkElement.type = 'text/css';
linkElement.href = 'styles.css'; 

document.head.appendChild(linkElement);

document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('sudoku-board');
    const generateBtn = document.getElementById('generate-btn');
    const checkBtn = document.getElementById('check-btn');
    const messageDiv = document.getElementById('message');
    
    let cells = [];
    let solution = [];
    
    //empty board
    function createBoard() {
        board.innerHTML = '';
        cells = [];
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.className = 'cell';
            cell.maxLength = 1;
            cell.dataset.index = i;
            
            //numbers 1-9 only
            cell.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^1-9]/g, '');
            });
            
            //arrow keys for navigation
            cell.addEventListener('keydown', function(e) {
                const index = parseInt(this.dataset.index);
                let newIndex;
                
                switch(e.key) {
                    case 'ArrowUp':
                        newIndex = index - 9;
                        if (newIndex >= 0) cells[newIndex].focus();
                        e.preventDefault();
                        break;
                    case 'ArrowDown':
                        newIndex = index + 9;
                        if (newIndex < 81) cells[newIndex].focus();
                        e.preventDefault();
                        break;
                    case 'ArrowLeft':
                        newIndex = index - 1;
                        if (index % 9 !== 0) cells[newIndex].focus();
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                        newIndex = index + 1;
                        if (index % 9 !== 8) cells[newIndex].focus();
                        e.preventDefault();
                        break;
                }
            });
            
            board.appendChild(cell);
            cells.push(cell);
        }
    }
    
    //generate sudoku
    function generatePuzzle() {
        //empty grid
        let grid = Array(9).fill().map(() => Array(9).fill(0));    
        //first solve the puzzle for rechecking later
        if (solveSudoku(grid)) {
            //store the solution
            solution = grid.map(row => [...row]);
            
            //remove numbers to create the puzzle
            //random generator to randomize how many cells to remove 
            const difficulty = Math.floor(Math.random() * 3); 
            const cellsToRemove = difficulty === 0 ? 40 : (difficulty === 1 ? 50 : 60);
            
            for (let i = 0; i < cellsToRemove; i++) {
                let row, col;
                do {
                    row = Math.floor(Math.random() * 9);
                    col = Math.floor(Math.random() * 9);
                } while (grid[row][col] === 0); //make sure na may laman yung cell na tatanggalan ng value
                
                grid[row][col] = 0;
            }
            
            //display the puzzle
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const index = row * 9 + col;
                    const value = grid[row][col];
                    
                    cells[index].value = value === 0 ? '' : value;
                    cells[index].readOnly = value !== 0;
                    cells[index].className = value !== 0 ? 'cell fixed' : 'cell';
                }
            }
            
            messageDiv.textContent = '';
        }
    }
    
    //solving the sudoku puzzle
    function solveSudoku(grid) {
        const emptyCell = findEmptyCell(grid);
        
        //if no empty cell, puzzle is solved
        if (!emptyCell) {
            return true;
        }
        
        const [row, col] = emptyCell;
        
        //randomize numbers to fill the empty cell
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums); 
        
        for (const num of nums) {
            if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0; //backtrack if the solution doesn't work
            }
        }
        
        return false;
    }
    
    //find empty cell (0 value)
    function findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    //checks if a number is placed correctly in terms of sudoku rules
    function isValid(grid, row, col, num) {
        //check row for duplicates
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) {
                return false;
            }
        }
        
        //check column for duplicates
        for (let y = 0; y < 9; y++) {
            if (grid[y][col] === num) {
                return false;
            }
        }
        
        //check 3x3 box for duplicates
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (grid[boxRow + y][boxCol + x] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    //randomize array of numbers (1-9)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    //check if the user's solution is correct
    function checkSolution() {
        //check first for empty cells
        for (const cell of cells) {
            if (cell.value === '') {
                messageDiv.textContent = 'Please fill all cells first!';
                return;
            }
        }
        
        //get the user values from the board
        let currentGrid = [];
        for (let row = 0; row < 9; row++) {
            let currentRow = [];
            for (let col = 0; col < 9; col++) {
                const index = row * 9 + col;
                currentRow.push(parseInt(cells[index].value));
            }
            currentGrid.push(currentRow);
        }
        
        //check if the user's solution is correct
        if (isValidSolution(currentGrid)) {
            messageDiv.textContent = 'You Win! Great job!';
            messageDiv.style.color = 'green';
        } else {
            messageDiv.textContent = 'You Lose! There are mistakes in your solution.';
            messageDiv.style.color = 'red';
        }
    }
    
    //validate the solution
    function isValidSolution(grid) {
        //check rows
        for (let row = 0; row < 9; row++) {
            const seen = new Set();
            for (let col = 0; col < 9; col++) {
                const num = grid[row][col];
                if (seen.has(num)) return false;
                seen.add(num);
            }
        }
        
        //check columns
        for (let col = 0; col < 9; col++) {
            const seen = new Set();
            for (let row = 0; row < 9; row++) {
                const num = grid[row][col];
                if (seen.has(num)) return false;
                seen.add(num);
            }
        }
        
        //check 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const seen = new Set();
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const num = grid[boxRow * 3 + row][boxCol * 3 + col];
                        if (seen.has(num)) return false;
                        seen.add(num);
                    }
                }
            }
        }
        
        return true;
    }
    
    //start game
    createBoard();
    generatePuzzle();
    
    //event listeners for generating puzzle and checking solution
    generateBtn.addEventListener('click', generatePuzzle);
    checkBtn.addEventListener('click', checkSolution);
});
