const { Engine, Render, Runner, World, Bodies, Body } = Matter;
/* Body's for adding velocity */
const engine = Engine.create();
const { world } = engine;

const cells = 20; // As grid is square 3x3, making one variable would be enough for now.
const width = 600;
const height = 600;
const unitLength = width / cells; // As width and height are same for now that's why.

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

let walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, 600, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];

World.add(world, walls);

// Generating Maze

let shuffle = (arr) => {
    let length = arr.length;
    while (length > 0) {
        const index = Math.floor(Math.random() * length);
        length--;
        let temp = arr[length];
        arr[length] = arr[index];
        arr[index] = temp;

    }
    return arr;
};

const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));
// Cool trick to avoid dual for-loops and make array of choice.

// For randomly position starting element inside grid.
const startingRow = Math.floor(Math.random() * cells);
const startingCol = Math.floor(Math.random() * cells);

const goThroughMaze = (row, col) => {
    // Check if randomly generated position already visited if then return;
    if (grid[row][col])
        return;

    // If not make it visited.
    grid[row][col] = true;

    // Calculate position for neighbors of current position.
    // It'd be in format of UP, RIGHT, BOTTOM, LEFT.
    // Don't know why shuffling this, I thought it would be
    // constant for any position. 

    const neighbors = shuffle([
        [row - 1, col, 'up'],
        [row, col + 1, 'right'],
        [row + 1, col, 'down'],
        [row, col - 1, 'left']
    ]);
    console.log(neighbors);
    // Now to iterate over each neighbor 
    for (let neighbor of neighbors) {
        const [nextRow, nextCol, direction] = neighbor;

        if (nextRow < 0 || nextRow >= cells || nextCol < 0 || nextCol >= cells || grid[nextRow][nextCol])
            continue;

        // Removing wall from either vertical or horizontals
        switch (direction) {
            case 'left': verticals[row][col - 1] = true; break;
            case 'right': verticals[row][col] = true; break;
            /* Anything greater than 1 in col will point the fact that we moved right so that's why just col - No it's because we will only remove walls of r0 and r1 can't touch r2 because it's border of maze. */
            case 'up': horizontals[row - 1][col] = true; break;
            case 'down': horizontals[row][col] = true; break;
        }

        // Visiting next cell
        goThroughMaze(nextRow, nextCol);
        // Eventually recursion to fill out the maze
    }
}

goThroughMaze(startingRow, startingCol);

horizontals.forEach((row, rowIndex) => {
    row.forEach((isWallOpen, colIndex) => {
        /* col contains whether there should be any wall or not */
        if (isWallOpen)
            return; // If there is no wall then return

        const wall = Bodies.rectangle(colIndex * unitLength + unitLength / 2, rowIndex * unitLength + unitLength, unitLength, 4, { isStatic: true });

        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((isWallOpen, colIndex) => {
        if (isWallOpen) return;
        const wall = Bodies.rectangle(colIndex * unitLength + unitLength, rowIndex * unitLength + unitLength / 2, 4, unitLength, { isStatic: true });

        World.add(world, wall);
    });
});

const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * .5,
    unitLength * .5, // 50% width and height of unit length
    { isStatic: true }
);

World.add(world, goal);

const ball = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    unitLength * .4, // This represent circle radius so .4 to set the circle diameter half as unit length
    { isStatic: false }
);

World.add(world, ball);

// Event listener on whole maze to detect key down event
document.addEventListener('keydown', event => {
    // Extracting current velocity of ball
    const { x, y } = ball.velocity;
    switch (event.keyCode) {
        case 87 /* Up */: Body.setVelocity(ball, { x, y: y - 5 }); break;
        case 83 /* Down */: Body.setVelocity(ball, { x, y: y + 5 }); break;
        case 65 /* Left */: Body.setVelocity(ball, { x: x - 5, y }); break;
        case 68 /* Right */: Body.setVelocity(ball, { x: x + 5, y }); break;
    }
});