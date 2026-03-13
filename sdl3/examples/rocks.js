/**
 * Space Rocks — a simple shooting game.
 *
 * Arrow keys to move, Space to fire, ESC to quit.
 * Destroy rocks for points. Enter to restart after game over.
 *
 * Run: tjs run sdl3/examples/rocks.js
 *
 * Sound assets:
 *   shoot.wav — "Laser Beam" (CC0) https://opengameart.org/content/laser-beam
 *   hit.wav   — "8-bit/NES Explosion Sound Effects" by TeamAlpha (CC-BY 3.0) https://opengameart.org/content/8-bitnes-explosion-sound-effecs
 *   music.wav — "5 Chiptunes (Action)" by Juhani Junkala (CC0) https://opengameart.org/content/5-chiptunes-action
 */

import {
    SDL, Window, EventType, Key, INIT_VIDEO, INIT_EVENTS, INIT_AUDIO,
    PixelFormat, TextureAccess, BlendMode, ScaleMode, SDLAudio,
} from '../src/index.js';

// --- Constants ---

const WIDTH = 640;
const HEIGHT = 480;
const FRAME_MS = 1000 / 30;

const SHIP_SPEED = 5;
const BULLET_SPEED = 10;
const FIRE_COOLDOWN = 6;
const SHIP_SCALE = 3;
const BULLET_SCALE = 2;
const MAX_BULLETS = 15;
const MAX_ROCKS = 25;
const SPAWN_INITIAL = 50;
const SPAWN_MIN = 15;


// --- Sprite data (8x8, LSB = leftmost pixel) ---

// prettier-ignore
const SHIP_SPRITE = new Uint8Array([
    0x18, 0x3C, 0x7E, 0xFF, 0xDB, 0x18, 0x24, 0x42,
]);

// prettier-ignore
const ROCK_SPRITES = [
    new Uint8Array([ 0x3C, 0x7E, 0xFF, 0xFF, 0xFF, 0x7E, 0x3C, 0x18 ]),
    new Uint8Array([ 0x38, 0x7C, 0xFE, 0xFF, 0x3F, 0x1E, 0x0C, 0x00 ]),
    new Uint8Array([ 0x0E, 0x1F, 0x3F, 0x7E, 0x7C, 0x3C, 0x18, 0x00 ]),
];

// prettier-ignore
const BULLET_SPRITE = new Uint8Array([
    0x18, 0x3C, 0x3C, 0x3C, 0x3C, 0x18, 0x00, 0x00,
]);


// --- 8x8 bitmap font (font8x8_basic, public domain, ASCII 32-126) ---
// Each glyph is 8 bytes; each byte is one row, LSB = leftmost pixel.
// prettier-ignore
const FONT_DATA = new Uint8Array([
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x18,0x3C,0x3C,0x18,0x18,0x00,0x18,0x00,
    0x36,0x36,0x00,0x00,0x00,0x00,0x00,0x00,
    0x36,0x36,0x7F,0x36,0x7F,0x36,0x36,0x00,
    0x0C,0x3E,0x03,0x1E,0x30,0x1F,0x0C,0x00,
    0x00,0x63,0x33,0x18,0x0C,0x66,0x63,0x00,
    0x1C,0x36,0x1C,0x6E,0x3B,0x33,0x6E,0x00,
    0x06,0x06,0x03,0x00,0x00,0x00,0x00,0x00,
    0x18,0x0C,0x06,0x06,0x06,0x0C,0x18,0x00,
    0x06,0x0C,0x18,0x18,0x18,0x0C,0x06,0x00,
    0x00,0x66,0x3C,0xFF,0x3C,0x66,0x00,0x00,
    0x00,0x0C,0x0C,0x3F,0x0C,0x0C,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x0C,0x0C,0x06,
    0x00,0x00,0x00,0x3F,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x0C,0x0C,0x00,
    0x60,0x30,0x18,0x0C,0x06,0x03,0x01,0x00,
    0x3E,0x63,0x73,0x7B,0x6F,0x67,0x3E,0x00,
    0x0C,0x0E,0x0C,0x0C,0x0C,0x0C,0x3F,0x00,
    0x1E,0x33,0x30,0x1C,0x06,0x33,0x3F,0x00,
    0x1E,0x33,0x30,0x1C,0x30,0x33,0x1E,0x00,
    0x38,0x3C,0x36,0x33,0x7F,0x30,0x78,0x00,
    0x3F,0x03,0x1F,0x30,0x30,0x33,0x1E,0x00,
    0x1C,0x06,0x03,0x1F,0x33,0x33,0x1E,0x00,
    0x3F,0x33,0x30,0x18,0x0C,0x0C,0x0C,0x00,
    0x1E,0x33,0x33,0x1E,0x33,0x33,0x1E,0x00,
    0x1E,0x33,0x33,0x3E,0x30,0x18,0x0E,0x00,
    0x00,0x0C,0x0C,0x00,0x00,0x0C,0x0C,0x00,
    0x00,0x0C,0x0C,0x00,0x00,0x0C,0x0C,0x06,
    0x18,0x0C,0x06,0x03,0x06,0x0C,0x18,0x00,
    0x00,0x00,0x3F,0x00,0x00,0x3F,0x00,0x00,
    0x06,0x0C,0x18,0x30,0x18,0x0C,0x06,0x00,
    0x1E,0x33,0x30,0x18,0x0C,0x00,0x0C,0x00,
    0x3E,0x63,0x7B,0x7B,0x7B,0x03,0x1E,0x00,
    0x0C,0x1E,0x33,0x33,0x3F,0x33,0x33,0x00,
    0x3F,0x66,0x66,0x3E,0x66,0x66,0x3F,0x00,
    0x3C,0x66,0x03,0x03,0x03,0x66,0x3C,0x00,
    0x1F,0x36,0x66,0x66,0x66,0x36,0x1F,0x00,
    0x7F,0x46,0x16,0x1E,0x16,0x46,0x7F,0x00,
    0x7F,0x46,0x16,0x1E,0x16,0x06,0x0F,0x00,
    0x3C,0x66,0x03,0x03,0x73,0x66,0x7C,0x00,
    0x33,0x33,0x33,0x3F,0x33,0x33,0x33,0x00,
    0x1E,0x0C,0x0C,0x0C,0x0C,0x0C,0x1E,0x00,
    0x78,0x30,0x30,0x30,0x33,0x33,0x1E,0x00,
    0x67,0x66,0x36,0x1E,0x36,0x66,0x67,0x00,
    0x0F,0x06,0x06,0x06,0x46,0x66,0x7F,0x00,
    0x63,0x77,0x7F,0x7F,0x6B,0x63,0x63,0x00,
    0x63,0x67,0x6F,0x7B,0x73,0x63,0x63,0x00,
    0x1C,0x36,0x63,0x63,0x63,0x36,0x1C,0x00,
    0x3F,0x66,0x66,0x3E,0x06,0x06,0x0F,0x00,
    0x1E,0x33,0x33,0x33,0x3B,0x1E,0x38,0x00,
    0x3F,0x66,0x66,0x3E,0x36,0x66,0x67,0x00,
    0x1E,0x33,0x07,0x0E,0x38,0x33,0x1E,0x00,
    0x3F,0x2D,0x0C,0x0C,0x0C,0x0C,0x1E,0x00,
    0x33,0x33,0x33,0x33,0x33,0x33,0x3F,0x00,
    0x33,0x33,0x33,0x33,0x33,0x1E,0x0C,0x00,
    0x63,0x63,0x63,0x6B,0x7F,0x77,0x63,0x00,
    0x63,0x63,0x36,0x1C,0x1C,0x36,0x63,0x00,
    0x33,0x33,0x33,0x1E,0x0C,0x0C,0x1E,0x00,
    0x7F,0x63,0x31,0x18,0x4C,0x66,0x7F,0x00,
    0x1E,0x06,0x06,0x06,0x06,0x06,0x1E,0x00,
    0x03,0x06,0x0C,0x18,0x30,0x60,0x40,0x00,
    0x1E,0x18,0x18,0x18,0x18,0x18,0x1E,0x00,
    0x08,0x1C,0x36,0x63,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,
    0x0C,0x0C,0x18,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x1E,0x30,0x3E,0x33,0x6E,0x00,
    0x07,0x06,0x06,0x3E,0x66,0x66,0x3B,0x00,
    0x00,0x00,0x1E,0x33,0x03,0x33,0x1E,0x00,
    0x38,0x30,0x30,0x3E,0x33,0x33,0x6E,0x00,
    0x00,0x00,0x1E,0x33,0x3F,0x03,0x1E,0x00,
    0x1C,0x36,0x06,0x0F,0x06,0x06,0x0F,0x00,
    0x00,0x00,0x6E,0x33,0x33,0x3E,0x30,0x1F,
    0x07,0x06,0x36,0x6E,0x66,0x66,0x67,0x00,
    0x0C,0x00,0x0E,0x0C,0x0C,0x0C,0x1E,0x00,
    0x30,0x00,0x30,0x30,0x30,0x33,0x33,0x1E,
    0x07,0x06,0x66,0x36,0x1E,0x36,0x67,0x00,
    0x0E,0x0C,0x0C,0x0C,0x0C,0x0C,0x1E,0x00,
    0x00,0x00,0x33,0x7F,0x7F,0x6B,0x63,0x00,
    0x00,0x00,0x1F,0x33,0x33,0x33,0x33,0x00,
    0x00,0x00,0x1E,0x33,0x33,0x33,0x1E,0x00,
    0x00,0x00,0x3B,0x66,0x66,0x3E,0x06,0x0F,
    0x00,0x00,0x6E,0x33,0x33,0x3E,0x30,0x78,
    0x00,0x00,0x3B,0x6E,0x66,0x06,0x0F,0x00,
    0x00,0x00,0x3E,0x03,0x1E,0x30,0x1F,0x00,
    0x08,0x0C,0x3E,0x0C,0x0C,0x2C,0x18,0x00,
    0x00,0x00,0x33,0x33,0x33,0x33,0x6E,0x00,
    0x00,0x00,0x33,0x33,0x33,0x1E,0x0C,0x00,
    0x00,0x00,0x63,0x6B,0x7F,0x7F,0x36,0x00,
    0x00,0x00,0x63,0x36,0x1C,0x36,0x63,0x00,
    0x00,0x00,0x33,0x33,0x33,0x3E,0x30,0x1F,
    0x00,0x00,0x3F,0x19,0x0C,0x26,0x3F,0x00,
    0x38,0x0C,0x0C,0x07,0x0C,0x0C,0x38,0x00,
    0x18,0x18,0x18,0x00,0x18,0x18,0x18,0x00,
    0x07,0x0C,0x0C,0x38,0x0C,0x0C,0x07,0x00,
    0x6E,0x3B,0x00,0x00,0x00,0x00,0x00,0x00,
]);

const CHAR_W = 8;
const CHAR_H = 8;
const ATLAS_COLS = 16;
const ATLAS_ROWS = 6;
const ATLAS_W = ATLAS_COLS * CHAR_W;
const ATLAS_H = ATLAS_ROWS * CHAR_H;
const FIRST_CHAR = 32;


// --- Texture builders ---

function buildSpritePixels(data) {
    const px = new Uint8Array(64 * 4);

    for (let y = 0; y < 8; y++) {
        const bits = data[y];

        for (let x = 0; x < 8; x++) {
            const on = (bits >> x) & 1;
            const i = (y * 8 + x) * 4;

            px[i] = 255;
            px[i + 1] = 255;
            px[i + 2] = 255;
            px[i + 3] = on ? 255 : 0;
        }
    }

    return px;
}

function buildFontAtlas() {
    const px = new Uint8Array(ATLAS_W * ATLAS_H * 4);

    for (let i = 0; i < 95; i++) {
        const col = i % ATLAS_COLS;
        const row = Math.floor(i / ATLAS_COLS);
        const bx = col * CHAR_W;
        const by = row * CHAR_H;

        for (let y = 0; y < CHAR_H; y++) {
            const bits = FONT_DATA[i * 8 + y];

            for (let x = 0; x < CHAR_W; x++) {
                const on = (bits >> x) & 1;
                const p = ((by + y) * ATLAS_W + (bx + x)) * 4;

                px[p] = 255;
                px[p + 1] = 255;
                px[p + 2] = 255;
                px[p + 3] = on ? 255 : 0;
            }
        }
    }

    return px;
}


// --- SDL init ---

SDL.loadLibrary();
SDL.init(INIT_VIDEO | INIT_EVENTS | INIT_AUDIO);
SDLAudio.open();

// Load sound assets
const base = new URL('.', import.meta.url).pathname;
const shootSnd = SDLAudio.loadWAV(base + 'assets/shoot.wav');
const hitSnd = SDLAudio.loadWAV(base + 'assets/hit.wav');
const musicSnd = SDLAudio.loadWAV(base + 'assets/music.wav');

musicSnd.play({ loop: true });

const win = new Window('Space Rocks', WIDTH, HEIGHT);
const renderer = win.createRenderer();

function createSpriteTex(data) {
    const tex = renderer.createTexture(
        PixelFormat.ABGR8888, TextureAccess.STATIC, 8, 8,
    );

    tex.update(buildSpritePixels(data), 32);
    tex.setBlendMode(BlendMode.BLEND);
    tex.setScaleMode(ScaleMode.NEAREST);

    return tex;
}

const fontTex = renderer.createTexture(
    PixelFormat.ABGR8888, TextureAccess.STATIC, ATLAS_W, ATLAS_H,
);

fontTex.update(buildFontAtlas(), ATLAS_W * 4);
fontTex.setBlendMode(BlendMode.BLEND);
fontTex.setScaleMode(ScaleMode.NEAREST);

const shipTex = createSpriteTex(SHIP_SPRITE);
const bulletTex = createSpriteTex(BULLET_SPRITE);
const rockTexes = ROCK_SPRITES.map(createSpriteTex);


// --- Star field ---

const stars = [];

for (let i = 0; i < 80; i++) {
    stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        b: 40 + Math.floor(Math.random() * 160),
    });
}


// --- Text helper ---

function drawText(text, x, y, scale) {
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i) - FIRST_CHAR;

        if (code < 0 || code >= 95) {
            continue;
        }

        const sc = code % ATLAS_COLS;
        const sr = Math.floor(code / ATLAS_COLS);

        renderer.copy(
            fontTex,
            { x: sc * CHAR_W, y: sr * CHAR_H, w: CHAR_W, h: CHAR_H },
            { x: x + i * CHAR_W * scale, y, w: CHAR_W * scale, h: CHAR_H * scale },
        );
    }
}


// --- Game state ---

let state = 'playing';
let score = 0;
let maxScore = 0;
let frame = 0;
let spawnTimer = 0;
let shotCooldown = 0;
const ship = { x: WIDTH / 2, y: HEIGHT - 60 };
const bullets = [];
const rocks = [];
const keysDown = new Set();


function resetGame() {
    ship.x = WIDTH / 2;
    ship.y = HEIGHT - 60;
    bullets.length = 0;
    rocks.length = 0;
    score = 0;
    spawnTimer = 0;
    shotCooldown = 0;
    frame = 0;
    state = 'playing';
}

function spawnRock() {
    if (rocks.length >= MAX_ROCKS) {
        return;
    }

    const edge = Math.floor(Math.random() * 4);
    const scale = 2 + Math.floor(Math.random() * 3);
    const speed = 1 + Math.random() * 2.5;
    const shape = Math.floor(Math.random() * ROCK_SPRITES.length);
    const tint = 130 + Math.floor(Math.random() * 70);
    const phase = Math.floor(Math.random() * 60);
    let x, y, vx, vy;

    if (edge === 0) {
        x = Math.random() * WIDTH;
        y = -30;
        vx = (Math.random() - 0.5) * 2;
        vy = speed;
    } else if (edge === 1) {
        x = WIDTH + 30;
        y = Math.random() * HEIGHT;
        vx = -speed;
        vy = (Math.random() - 0.5) * 2;
    } else if (edge === 2) {
        x = Math.random() * WIDTH;
        y = HEIGHT + 30;
        vx = (Math.random() - 0.5) * 2;
        vy = -speed;
    } else {
        x = -30;
        y = Math.random() * HEIGHT;
        vx = speed;
        vy = (Math.random() - 0.5) * 2;
    }

    rocks.push({ x, y, vx, vy, scale, shape, tint, phase });
}


// --- Update ---

function update() {
    frame++;

    // Ship movement
    if (keysDown.has(Key.LEFT)) {
        ship.x -= SHIP_SPEED;
    }

    if (keysDown.has(Key.RIGHT)) {
        ship.x += SHIP_SPEED;
    }

    if (keysDown.has(Key.UP)) {
        ship.y -= SHIP_SPEED;
    }

    if (keysDown.has(Key.DOWN)) {
        ship.y += SHIP_SPEED;
    }

    const halfS = SHIP_SCALE * 4;

    ship.x = Math.max(halfS, Math.min(WIDTH - halfS, ship.x));
    ship.y = Math.max(halfS, Math.min(HEIGHT - halfS, ship.y));

    // Firing
    if (shotCooldown > 0) {
        shotCooldown--;
    }

    if (keysDown.has(Key.SPACE) && shotCooldown === 0 && bullets.length < MAX_BULLETS) {
        bullets.push({ x: ship.x, y: ship.y - halfS });
        shotCooldown = FIRE_COOLDOWN;
        shootSnd.play();
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;

        if (bullets[i].y < -20) {
            bullets.splice(i, 1);
        }
    }

    // Spawn rocks
    const spawnInterval = Math.max(SPAWN_MIN, SPAWN_INITIAL - Math.floor(score / 100) * 5);

    spawnTimer++;

    if (spawnTimer >= spawnInterval) {
        spawnRock();
        spawnTimer = 0;
    }

    // Update rocks
    for (let i = rocks.length - 1; i >= 0; i--) {
        const r = rocks[i];

        r.x += r.vx;
        r.y += r.vy;

        if (r.x < -100 || r.x > WIDTH + 100 || r.y < -100 || r.y > HEIGHT + 100) {
            rocks.splice(i, 1);
        }
    }

    // Bullet-rock collisions
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];

        for (let ri = rocks.length - 1; ri >= 0; ri--) {
            const r = rocks[ri];
            const dx = b.x - r.x;
            const dy = b.y - r.y;
            const dist = r.scale * 4 + BULLET_SCALE * 2;

            if (dx * dx + dy * dy < dist * dist) {
                bullets.splice(bi, 1);
                rocks.splice(ri, 1);
                score += (6 - r.scale) * 10;
                hitSnd.play();

                if (score > maxScore) {
                    maxScore = score;
                }

                break;
            }
        }
    }

    // Ship-rock collisions
    for (const r of rocks) {
        const dx = ship.x - r.x;
        const dy = ship.y - r.y;
        const dist = r.scale * 4 + SHIP_SCALE * 3;

        if (dx * dx + dy * dy < dist * dist) {
            state = 'gameover';
            musicSnd.stop();
            hitSnd.play();

            if (score > maxScore) {
                maxScore = score;
            }

            break;
        }
    }
}


// --- Draw ---

function draw() {
    renderer.setDrawColor(10, 10, 20);
    renderer.clear();

    // Stars
    for (const s of stars) {
        renderer.setDrawColor(s.b, s.b, Math.min(255, s.b + 20));
        renderer.drawPoint(s.x, s.y);
    }

    // Rocks (cycle shapes for tumble effect)
    for (const r of rocks) {
        const idx = Math.floor((frame + r.phase) / 20) % rockTexes.length;
        const tex = rockTexes[idx];

        tex.setColorMod(r.tint, Math.max(0, r.tint - 20), Math.max(0, r.tint - 40));

        const half = r.scale * 4;

        renderer.copy(tex, null, {
            x: r.x - half, y: r.y - half, w: half * 2, h: half * 2,
        });
    }

    // Bullets
    bulletTex.setColorMod(255, 255, 100);

    const bHalf = BULLET_SCALE * 4;

    for (const b of bullets) {
        renderer.copy(bulletTex, null, {
            x: b.x - bHalf, y: b.y - bHalf, w: bHalf * 2, h: bHalf * 2,
        });
    }

    // Ship
    const sHalf = SHIP_SCALE * 4;

    if (state === 'gameover') {
        shipTex.setColorMod(255, 50, 50);
    } else {
        shipTex.setColorMod(0, 255, 200);
    }

    renderer.copy(shipTex, null, {
        x: ship.x - sHalf, y: ship.y - sHalf, w: sHalf * 2, h: sHalf * 2,
    });

    // HI score (top left)
    fontTex.setColorMod(100, 100, 120);
    drawText('HI', 10, 10, 2);
    fontTex.setColorMod(200, 200, 220);
    drawText(String(maxScore).padStart(5, '0'), 10 + 3 * 16, 10, 2);

    // Current score (top right)
    fontTex.setColorMod(255, 220, 80);

    const scoreStr = String(score).padStart(5, '0');

    drawText(scoreStr, WIDTH - scoreStr.length * 16 - 10, 10, 2);

    // Game over overlay
    if (state === 'gameover') {
        const goText = 'GAME OVER';
        const goW = goText.length * CHAR_W * 4;

        fontTex.setColorMod(255, 60, 60);
        drawText(goText, (WIDTH - goW) / 2, HEIGHT / 2 - 40, 4);

        const rText = 'PRESS ENTER';
        const rW = rText.length * CHAR_W * 2;

        fontTex.setColorMod(180, 180, 190);
        drawText(rText, (WIDTH - rW) / 2, HEIGHT / 2 + 20, 2);
    }

    renderer.present();
}


// --- Main loop ---

let running = true;
let lastTick = SDL.getTicks();

while (running) {
    for (const event of SDL.pollEvents()) {
        if (event.type === EventType.QUIT || event.type === EventType.WINDOW_CLOSE_REQUESTED) {
            running = false;
        }

        if (event.type === EventType.KEY_DOWN) {
            if (event.key === Key.ESCAPE) {
                running = false;
            }

            keysDown.add(event.key);

            if (state === 'gameover' && event.key === Key.RETURN) {
                resetGame();
                musicSnd.play({ loop: true });
            }
        }

        if (event.type === EventType.KEY_UP) {
            keysDown.delete(event.key);
        }
    }

    if (!running) {
        break;
    }

    if (state === 'playing') {
        update();
    }

    musicSnd.update();
    draw();

    // Cap at 30 FPS
    const now = SDL.getTicks();
    const elapsed = now - lastTick;

    if (elapsed < FRAME_MS) {
        SDL.delay(Math.floor(FRAME_MS - elapsed));
    }

    lastTick = SDL.getTicks();
}

// Cleanup
shootSnd.destroy();
hitSnd.destroy();
musicSnd.destroy();
SDLAudio.close();

fontTex.destroy();
shipTex.destroy();
bulletTex.destroy();

for (const tex of rockTexes) {
    tex.destroy();
}

renderer.destroy();
win.destroy();
SDL.quit();
