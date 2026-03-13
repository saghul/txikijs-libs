/**
 * SDL3 minimal demo: draw a colored rectangle.
 *
 * Run: tjs run sdl3/demo-hello.js
 */

import { SDL, Window, EventType } from '../src/index.js';

SDL.loadLibrary();
SDL.init();

const window = new Window('Hello SDL3!', 640, 480);
const renderer = window.createRenderer();

let running = true;
let hue = 0;

while (running) {
    for (const event of SDL.pollEvents()) {
        if (event.type === EventType.QUIT || event.type === EventType.WINDOW_CLOSE_REQUESTED) {
            running = false;
        }
    }

    if (!running) {
        break;
    }

    // Cycle hue
    hue = (hue + 1) % 360;
    const { r, g, b } = hslToRgb(hue / 360, 0.8, 0.5);

    // Clear to dark
    renderer.setDrawColor(20, 20, 30);
    renderer.clear();

    // Draw a centered rectangle that cycles color
    renderer.setDrawColor(r, g, b);
    renderer.fillRect(640 / 2 - 100, 480 / 2 - 75, 200, 150);

    // White border
    renderer.setDrawColor(255, 255, 255);
    renderer.drawRect(640 / 2 - 100, 480 / 2 - 75, 200, 150);

    renderer.present();
    SDL.delay(16);
}

renderer.destroy();
window.destroy();
SDL.quit();

function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    const sector = Math.floor(h * 6);

    switch (sector % 6) {
        case 0: r = c; g = x; b = 0; break;
        case 1: r = x; g = c; b = 0; break;
        case 2: r = 0; g = c; b = x; break;
        case 3: r = 0; g = x; b = c; break;
        case 4: r = x; g = 0; b = c; break;
        case 5: r = c; g = 0; b = x; break;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}
