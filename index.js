const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
/* Body's for adding velocity 
   Events for detecting different event happening in our world
*/
const engine = Engine.create();
/* Disabling gravity as it messes up the ball movements */
// engine.world.gravity.x = 0;
engine.world.gravity.y = 0; /* in y direction */
const { world } = engine;

const horizontalCells = 24;
const verticalCells = 23;

/* Setting width and height according to space available on screen */
const width = window.innerWidth;
const height = window.innerHeight;

const horizontalWallSize = 5;
const verticalWallSize = 5;

const unitLengthX = width / horizontalCells; /* width length - total width / total cell = length of each individual cell */

const unitLengthY = height / verticalCells;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

let walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
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

const grid = Array(verticalCells)
    .fill(null)
    .map(() => Array(horizontalCells).fill(false));

const verticals = Array(horizontalCells)
    .fill(null)
    .map(() => Array(verticalCells - 1).fill(false));

const horizontals = Array(horizontalCells - 1)
    .fill(null)
    .map(() => Array(verticalCells).fill(false));
// Cool trick to avoid dual for-loops and make array of choice.

// For randomly position starting element inside grid.
const startingRow = Math.floor(Math.random() * verticalCells);
const startingCol = Math.floor(Math.random() * horizontalCells);

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
    // Now to iterate over each neighbor 
    for (let neighbor of neighbors) {
        const [nextRow, nextCol, direction] = neighbor;

        if (nextRow < 0 || nextRow >= verticalCells || nextCol < 0 || nextCol >= horizontalCells || grid[nextRow][nextCol])
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

        const wall = Bodies.rectangle(
            colIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            horizontalWallSize,
            {
                isStatic: true, label: 'wall',
                render: {
                    fillStyle: '#f4b6c2'
                }
            });

        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((isWallOpen, colIndex) => {
        if (isWallOpen) return;
        const wall = Bodies.rectangle(
            colIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            verticalWallSize,
            unitLengthY,
            {
                isStatic: true, label: 'wall',
                render: {
                    fillStyle: '#eec9d2'
                }
            });

        World.add(world, wall);
    });
});

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .5, // Width
    unitLengthY * .5, // 50% width and height of unit length
    {
        isStatic: true, label: 'goal',
        render: {
            fillStyle: '#f6abb6'
        }
    }
);

World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius, // This represent circle radius so .4 to set the circle diameter half as unit length
    {
        isStatic: false, label: 'ball',
        render: {
            fillStyle: '#feb2a8'
        }
    }
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

// Win condition
const winMessage = document.querySelector('.winner');
const deleteMessage = document.querySelector('.delete');

Events.on(engine, 'collisionStart', event => {
    const label = ['ball', 'goal'];
    event.pairs.forEach(collision => { /* pairs what contain information about different objects when they collide with each other */
        if (label.includes(collision.bodyA.label) && label.includes(collision.bodyB.label)) {
            // When user wins conditions
            // Turning gravity back on
            world.gravity.y = 1;
            // Selecting all the walls and enabling gravity on them
            world.bodies.forEach((body) => {
                if (body.label === 'wall' || body.label === 'goal')
                    Body.setStatic(body, false);
            });
            winMessage.classList.remove('hidden');
            winMessage.style.backgroundColor = 'black';
        }
    })
});

deleteMessage.addEventListener('click', (event) => {
    event.target.parentElement.remove();
    winMessage.parentNode.removeChild(winMessage); /* Bringing bended canvas back to life */
});