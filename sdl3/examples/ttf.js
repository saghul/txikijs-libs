/**
 * SDL3 + TTF demo: render text with TrueType fonts.
 *
 * - ESC or closing the window quits
 *
 * Run: tjs run sdl3/demo-ttf.js
 */

import {
    SDL, Window, Font, FontStyle, SDLTTF,
    EventType, Key,
} from '../src/index.js';

// --- Initialize ---
SDL.loadLibrary();
SDLTTF.loadLibrary();
SDL.init();
SDLTTF.init();

const WIDTH = 800;
const HEIGHT = 500;

const window = new Window('txiki.js SDL3 TTF Demo', WIDTH, HEIGHT);
const renderer = window.createRenderer();

// Use a system font (macOS). Adjust path for your platform.
const FONT_PATH = '/System/Library/Fonts/Supplemental/Arial.ttf';
const font = new Font(FONT_PATH, 36);
const smallFont = new Font(FONT_PATH, 20);

// Print font info
console.log(`Font: ${font.familyName} ${font.styleName}`);
console.log(`Height: ${font.height}, Ascent: ${font.ascent}, Descent: ${font.descent}`);
console.log(`Fixed width: ${font.isFixedWidth}`);

// Pre-render some text surfaces and convert to textures
function textTexture(f, text, r, g, b) {
    const surface = f.renderBlended(text, r, g, b);
    const texture = renderer.createTextureFromSurface(surface);
    const size = f.measureText(text);

    surface.destroy();

    return { texture, ...size };
}

const title = textTexture(font, 'txiki.js + SDL3 + TTF!', 80, 200, 255);
const subtitle = textTexture(smallFont, 'TrueType font rendering via FFI bindings', 200, 200, 200);
const infoText = `Font: ${font.familyName} | Size: ${font.size}pt | Height: ${font.height}px`;
const info = textTexture(smallFont, infoText, 150, 150, 150);

// Animated text
let frame = 0;
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

    renderer.setDrawColor(30, 30, 40);
    renderer.clear();

    // Title centered
    renderer.copy(title.texture, null, {
        x: (WIDTH - title.width) / 2,
        y: 60,
        w: title.width,
        h: title.height,
    });

    // Subtitle
    renderer.copy(subtitle.texture, null, {
        x: (WIDTH - subtitle.width) / 2,
        y: 120,
        w: subtitle.width,
        h: subtitle.height,
    });

    // Font info
    renderer.copy(info.texture, null, {
        x: (WIDTH - info.width) / 2,
        y: 170,
        w: info.width,
        h: info.height,
    });

    // Animated bouncing text
    frame++;
    const yOff = Math.sin(frame * 0.03) * 30;

    // Bold text
    font.style = FontStyle.BOLD;
    const boldSurf = font.renderBlended('Bold!', 255, 100, 100);
    const boldTex = renderer.createTextureFromSurface(boldSurf);
    const boldSize = font.measureText('Bold!');

    renderer.copy(boldTex, null, {
        x: WIDTH / 4 - boldSize.width / 2,
        y: 280 + yOff,
        w: boldSize.width,
        h: boldSize.height,
    });
    boldSurf.destroy();
    boldTex.destroy();

    // Italic text
    font.style = FontStyle.ITALIC;
    const italicSurf = font.renderBlended('Italic!', 100, 255, 100);
    const italicTex = renderer.createTextureFromSurface(italicSurf);
    const italicSize = font.measureText('Italic!');

    renderer.copy(italicTex, null, {
        x: WIDTH / 2 - italicSize.width / 2,
        y: 280 - yOff,
        w: italicSize.width,
        h: italicSize.height,
    });
    italicSurf.destroy();
    italicTex.destroy();

    // Underline text
    font.style = FontStyle.UNDERLINE;
    const ulSurf = font.renderBlended('Underline!', 100, 100, 255);
    const ulTex = renderer.createTextureFromSurface(ulSurf);
    const ulSize = font.measureText('Underline!');

    renderer.copy(ulTex, null, {
        x: (WIDTH * 3) / 4 - ulSize.width / 2,
        y: 280 + yOff,
        w: ulSize.width,
        h: ulSize.height,
    });
    ulSurf.destroy();
    ulTex.destroy();

    // Reset style
    font.style = FontStyle.NORMAL;

    // Wrapped text at bottom
    const wrappedText = 'This text is rendered with word wrapping enabled. '
        + 'It will automatically break lines to fit within the specified width. Pretty neat!';
    const wrappedSurf = smallFont.renderWrapped(
        wrappedText,
        220, 220, 180, 500,
    );
    const wrappedTex = renderer.createTextureFromSurface(wrappedSurf);
    const wrappedSize = smallFont.measureText('This text is rendered');

    // Get actual wrapped surface dimensions from height estimate
    renderer.copy(wrappedTex, null, {
        x: (WIDTH - 500) / 2,
        y: 370,
        w: 500,
        h: wrappedSize.height * 4,
    });
    wrappedSurf.destroy();
    wrappedTex.destroy();

    renderer.present();
    SDL.delay(16);
}

// Cleanup
title.texture.destroy();
subtitle.texture.destroy();
info.texture.destroy();
smallFont.close();
font.close();
renderer.destroy();
window.destroy();
SDLTTF.quit();
SDL.quit();

console.log('Done!');
