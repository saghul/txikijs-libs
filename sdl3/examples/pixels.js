/**
 * SDL3 demo: real-time pixel buffer manipulation.
 *
 * Renders a plasma effect by writing directly to a streaming texture.
 *
 * - ESC or closing the window quits
 *
 * Run: tjs run sdl3/examples/pixels.js
 */

import {
    SDL, Window, EventType, Key,
    PixelFormat, TextureAccess,
} from '../src/index.js';

const WIDTH = 400;
const HEIGHT = 300;
const SCALE = 2;

SDL.loadLibrary();
SDL.init();

const window = new Window('txiki.js SDL3 Plasma', WIDTH * SCALE, HEIGHT * SCALE);
const renderer = window.createRenderer();

// Create a streaming texture we can update per-frame
const texture = renderer.createTexture(
    PixelFormat.ABGR8888,
    TextureAccess.STREAMING,
    WIDTH,
    HEIGHT,
);

// RGBA pixel buffer
const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

const FRAME_MS = 1000 / 30;
let running = true;
let lastTick = SDL.getTicks();

while (running) {
    for (const event of SDL.pollEvents()) {
        if (event.type === EventType.QUIT || event.type === EventType.WINDOW_CLOSE_REQUESTED) {
            running = false;
        }

        if (event.type === EventType.KEY_DOWN && event.key === Key.ESCAPE) {
            running = false;
        }
    }

    if (!running) {
        break;
    }

    const t = SDL.getTicks() / 1000;

    // Generate plasma
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const v1 = Math.sin(x * 0.03 + t);
            const v2 = Math.sin(y * 0.04 + t * 0.7);
            const v3 = Math.sin((x + y) * 0.02 + t * 1.3);
            const v4 = Math.sin(Math.sqrt(
                (x - WIDTH / 2) * (x - WIDTH / 2) +
                (y - HEIGHT / 2) * (y - HEIGHT / 2)
            ) * 0.05 + t);

            const v = (v1 + v2 + v3 + v4) / 4;

            const i = (y * WIDTH + x) * 4;

            pixels[i]     = Math.floor((Math.sin(v * Math.PI) * 0.5 + 0.5) * 255);
            pixels[i + 1] = Math.floor((Math.sin(v * Math.PI + 2.094) * 0.5 + 0.5) * 255);
            pixels[i + 2] = Math.floor((Math.sin(v * Math.PI + 4.188) * 0.5 + 0.5) * 255);
            pixels[i + 3] = 255;
        }
    }

    // Upload pixels to texture
    texture.update(pixels, WIDTH * 4);

    // Render texture to screen (stretched to window size)
    renderer.copy(texture);

    renderer.present();

    // Cap at 30 FPS
    const now = SDL.getTicks();
    const elapsed = now - lastTick;

    if (elapsed < FRAME_MS) {
        SDL.delay(Math.floor(FRAME_MS - elapsed));
    }

    lastTick = SDL.getTicks();
}

texture.destroy();
renderer.destroy();
window.destroy();
SDL.quit();

console.log('Done!');
