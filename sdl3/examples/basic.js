/**
 * SDL3 demo: bouncing rectangles with keyboard control.
 *
 * - Arrow keys move the player (green square)
 * - ESC or closing the window quits
 * - Colored rectangles bounce around the screen
 *
 * Run: tjs run sdl3/demo.js
 */

import {
    SDL, Window, EventType, Key, WindowFlags,
} from '../src/index.js';

const WIDTH = 800;
const HEIGHT = 600;
const RECT_SIZE = 40;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5;
const NUM_RECTS = 12;

// --- Initialize ---
SDL.loadLibrary();
SDL.init();

const window = new Window('txiki.js SDL3 Demo', WIDTH, HEIGHT, WindowFlags.RESIZABLE);
const renderer = window.createRenderer();

// --- Bouncing rectangles ---
const rects = [];

for (let i = 0; i < NUM_RECTS; i++) {
    rects.push({
        x: Math.random() * (WIDTH - RECT_SIZE),
        y: Math.random() * (HEIGHT - RECT_SIZE),
        vx: (Math.random() * 4 + 1) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() * 4 + 1) * (Math.random() > 0.5 ? 1 : -1),
        r: Math.floor(Math.random() * 200 + 55),
        g: Math.floor(Math.random() * 200 + 55),
        b: Math.floor(Math.random() * 200 + 55),
    });
}

// --- Player ---
const player = {
    x: WIDTH / 2 - PLAYER_SIZE / 2,
    y: HEIGHT / 2 - PLAYER_SIZE / 2,
};
const keys = { up: false, down: false, left: false, right: false };

// --- Main loop ---
let running = true;

while (running) {
    // Process events
    for (const event of SDL.pollEvents()) {
        switch (event.type) {
            case EventType.QUIT:
            case EventType.WINDOW_CLOSE_REQUESTED:
                running = false;
                break;

            case EventType.KEY_DOWN:
                if (event.key === Key.ESCAPE) {
                    running = false;
                }

                if (event.key === Key.UP || event.key === Key.w) {
                    keys.up = true;
                }

                if (event.key === Key.DOWN || event.key === Key.s) {
                    keys.down = true;
                }

                if (event.key === Key.LEFT || event.key === Key.a) {
                    keys.left = true;
                }

                if (event.key === Key.RIGHT || event.key === Key.d) {
                    keys.right = true;
                }

                break;

            case EventType.KEY_UP:
                if (event.key === Key.UP || event.key === Key.w) {
                    keys.up = false;
                }

                if (event.key === Key.DOWN || event.key === Key.s) {
                    keys.down = false;
                }

                if (event.key === Key.LEFT || event.key === Key.a) {
                    keys.left = false;
                }

                if (event.key === Key.RIGHT || event.key === Key.d) {
                    keys.right = false;
                }

                break;
        }
    }

    if (!running) {
        break;
    }

    // Move player
    if (keys.up)    {
        player.y -= PLAYER_SPEED;
    }

    if (keys.down)  {
        player.y += PLAYER_SPEED;
    }

    if (keys.left)  {
        player.x -= PLAYER_SPEED;
    }

    if (keys.right) {
        player.x += PLAYER_SPEED;
    }

    // Clamp player
    player.x = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, player.x));
    player.y = Math.max(0, Math.min(HEIGHT - PLAYER_SIZE, player.y));

    // Update bouncing rects
    for (const r of rects) {
        r.x += r.vx;
        r.y += r.vy;

        if (r.x <= 0 || r.x + RECT_SIZE >= WIDTH) {
            r.vx *= -1;
        }

        if (r.y <= 0 || r.y + RECT_SIZE >= HEIGHT) {
            r.vy *= -1;
        }

        r.x = Math.max(0, Math.min(WIDTH - RECT_SIZE, r.x));
        r.y = Math.max(0, Math.min(HEIGHT - RECT_SIZE, r.y));
    }

    // Draw
    renderer.setDrawColor(24, 24, 32);
    renderer.clear();

    // Draw bouncing rects
    for (const r of rects) {
        renderer.setDrawColor(r.r, r.g, r.b, 200);
        renderer.fillRect(r.x, r.y, RECT_SIZE, RECT_SIZE);
    }

    // Draw player
    renderer.setDrawColor(0, 220, 80);
    renderer.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Draw border around player
    renderer.setDrawColor(255, 255, 255);
    renderer.drawRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Draw some lines as a grid pattern
    renderer.setDrawColor(40, 40, 60, 100);

    for (let x = 0; x < WIDTH; x += 50) {
        renderer.drawLine(x, 0, x, HEIGHT);
    }

    for (let y = 0; y < HEIGHT; y += 50) {
        renderer.drawLine(0, y, WIDTH, y);
    }

    renderer.present();

    // ~60 FPS
    SDL.delay(16);
}

// Cleanup
renderer.destroy();
window.destroy();
SDL.quit();

console.log('Done!');
