/**
 * SDL3 + Image demo: load and display a PNG/JPG/etc image.
 *
 * Usage: tjs run sdl3/demo-image.js <image-path>
 *
 * Example: tjs run sdl3/demo-image.js ~/photo.jpg
 */

import { SDL, Window, EventType, Key, SDLImage } from '../src/index.js';

const imagePath = globalThis.tjs.args[3];

if (!imagePath) {
    console.log('Usage: tjs run sdl3/demo-image.js <image-path>');
    console.log('  Supports PNG, JPG, BMP, GIF, WEBP, TIFF, SVG, etc.');
    globalThis.tjs.exit(1);
}

SDL.loadLibrary();
SDLImage.loadLibrary();
SDL.init();

// Load as texture directly (most efficient)
const window = new Window(`Image: ${imagePath}`, 800, 600, 0x20n /* RESIZABLE */);
const renderer = window.createRenderer();
const texture = SDLImage.loadTexture(renderer, imagePath);

let running = true;

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

    renderer.setDrawColor(40, 40, 40);
    renderer.clear();

    // Draw image stretched to window (null src + null dst = full)
    renderer.copy(texture);

    renderer.present();
    SDL.delay(16);
}

texture.destroy();
renderer.destroy();
window.destroy();
SDLImage.close();
SDL.quit();
