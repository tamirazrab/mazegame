const { Engine, Render, Runner, World, Bodies } = Matter;
const engine = Engine.create();
const { world } = engine;

const cells = 3; // As grid is square 3x3, making one variable would be enough for now.
const width = 600;
const height = 600;

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
    Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
    Bodies.rectangle(width / 2, 600, width, 40, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];

World.add(world, walls);

// Generating Maze
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
    const neighbors = [
        [row - 1, col],
        [row, col + 1],
        [row + 1, col],
        [row, col - 1]
    ];

}

