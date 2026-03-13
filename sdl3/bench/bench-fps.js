/**
 * SDL3 FPS benchmark: measures frame rate with many draw calls per frame.
 *
 * Compares fast_call (dlopen) vs CFunction.call() (slow) paths.
 * Run: tjs run sdl3/bench-fps.js
 */

import { dlopen, Lib, CFunction, types, suffix, bufferToPointer } from 'tjs:ffi';

const RECTS_PER_FRAME = 500;
const BENCH_FRAMES = 500;

const sopath = `/opt/homebrew/lib/libSDL3.${suffix}`;

// --- Symbol definitions (subset needed for rendering) ---

const SYM_DEFS = {
    SDL_Init:               { args: [ 'u32' ],                              returns: 'u8' },
    SDL_Quit:               { args: [] },
    SDL_GetError:           { args: [],                                   returns: 'string' },
    SDL_CreateWindow:       { args: [ 'string', 'i32', 'i32', 'u64' ],     returns: 'ptr' },
    SDL_DestroyWindow:      { args: [ 'ptr' ] },
    SDL_CreateRenderer:     { args: [ 'ptr', 'ptr' ],                       returns: 'ptr' },
    SDL_DestroyRenderer:    { args: [ 'ptr' ] },
    SDL_SetRenderDrawColor: { args: [ 'ptr', 'u8', 'u8', 'u8', 'u8' ],    returns: 'u8' },
    SDL_RenderClear:        { args: [ 'ptr' ],                              returns: 'u8' },
    SDL_RenderPresent:      { args: [ 'ptr' ],                              returns: 'u8' },
    SDL_RenderFillRect:     { args: [ 'ptr', 'ptr' ],                       returns: 'u8' },
    SDL_PollEvent:          { args: [ 'buffer' ],                           returns: 'u8' },
};

// --- Build a slow-path (CFunction.call) binding ---

const typeMap = {
    u8: types.uint8, u16: types.uint16, u32: types.uint32, u64: types.uint64,
    i8: types.sint8, i16: types.sint16, i32: types.sint32, i64: types.sint64,
    f32: types.float, f64: types.double,
    ptr: types.pointer, string: types.string, buffer: types.buffer,
    void: types.void,
};

function resolveType(t) {
    return typeof t === 'string' ? typeMap[t] : t;
}

function openSlow(path, defs) {
    const lib = new Lib(path);
    const result = {};

    for (const [ name, def ] of Object.entries(defs)) {
        const sym = lib.symbol(name);
        const ret = resolveType(def.returns ?? 'void');
        const args = (def.args ?? []).map(resolveType);
        const func = new CFunction(sym, ret, args);

        result[name] = (...a) => func.call(...a);
    }

    return { symbols: result, close: () => lib.close() };
}

// --- Benchmark runner ---

function runBench(label, s) {
    const INIT_VIDEO = 0x00000020;
    const INIT_EVENTS = 0x00004000;

    if (!s.SDL_Init(INIT_VIDEO | INIT_EVENTS)) {
        throw new Error(`SDL_Init failed: ${s.SDL_GetError()}`);
    }

    const win = s.SDL_CreateWindow(label, 400, 300, 0);

    if (!win) {
        throw new Error(`SDL_CreateWindow failed: ${s.SDL_GetError()}`);
    }

    const ren = s.SDL_CreateRenderer(win, null);

    if (!ren) {
        throw new Error(`SDL_CreateRenderer failed: ${s.SDL_GetError()}`);
    }

    // Pre-allocate rect buffer.
    const frect = new Float32Array(4);
    const frectPtr = bufferToPointer(new Uint8Array(frect.buffer));
    const eventBuf = new Uint8Array(128);

    // Warmup (10 frames).
    for (let f = 0; f < 10; f++) {
        s.SDL_SetRenderDrawColor(ren, 0, 0, 0, 255);
        s.SDL_RenderClear(ren);

        for (let i = 0; i < RECTS_PER_FRAME; i++) {
            s.SDL_SetRenderDrawColor(ren, i & 255, (i * 7) & 255, (i * 13) & 255, 255);
            frect[0] = (i * 3) % 380;
            frect[1] = (i * 5) % 280;
            frect[2] = 20;
            frect[3] = 20;
            s.SDL_RenderFillRect(ren, frectPtr);
        }

        s.SDL_RenderPresent(ren);

        while (s.SDL_PollEvent(eventBuf)) { /* drain */ }
    }

    // Timed run.
    const start = performance.now();

    for (let f = 0; f < BENCH_FRAMES; f++) {
        s.SDL_SetRenderDrawColor(ren, 0, 0, 0, 255);
        s.SDL_RenderClear(ren);

        for (let i = 0; i < RECTS_PER_FRAME; i++) {
            const c = (f * RECTS_PER_FRAME + i);

            s.SDL_SetRenderDrawColor(ren, c & 255, (c * 7) & 255, (c * 13) & 255, 255);
            frect[0] = (i * 3) % 380;
            frect[1] = (i * 5) % 280;
            frect[2] = 20;
            frect[3] = 20;
            s.SDL_RenderFillRect(ren, frectPtr);
        }

        s.SDL_RenderPresent(ren);

        while (s.SDL_PollEvent(eventBuf)) { /* drain */ }
    }

    const elapsed = performance.now() - start;

    s.SDL_DestroyRenderer(ren);
    s.SDL_DestroyWindow(win);
    s.SDL_Quit();

    return elapsed;
}

// --- Main ---

// FFI calls per frame: SetDrawColor + Clear + (SetDrawColor + FillRect) * RECTS + Present + PollEvent
const callsPerFrame = 2 + RECTS_PER_FRAME * 2 + 1 + 1;

console.log('SDL3 FPS Benchmark');
console.log(`  ${RECTS_PER_FRAME} filled rects/frame, ${BENCH_FRAMES} frames, ~${callsPerFrame} FFI calls/frame`);
console.log('');

// --- Fast path (dlopen with fast_call) ---
{
    const dl = dlopen(sopath, SYM_DEFS);
    const elapsed = runBench('fast_call', dl.symbols);
    const fps = (BENCH_FRAMES / elapsed * 1000).toFixed(1);
    const totalCalls = callsPerFrame * BENCH_FRAMES;
    const nsPerCall = ((elapsed / totalCalls) * 1e6).toFixed(0);

    console.log(`  fast_call (dlopen):     ${fps} fps  (${(elapsed).toFixed(1)} ms, ${nsPerCall} ns/ffi-call)`);
    dl.close();
}

// --- Slow path (CFunction.call) ---
{
    const dl = openSlow(sopath, SYM_DEFS);
    const elapsed = runBench('CFunction.call', dl.symbols);
    const fps = (BENCH_FRAMES / elapsed * 1000).toFixed(1);
    const totalCalls = callsPerFrame * BENCH_FRAMES;
    const nsPerCall = ((elapsed / totalCalls) * 1e6).toFixed(0);

    console.log(`  CFunction.call (slow):  ${fps} fps  (${(elapsed).toFixed(1)} ms, ${nsPerCall} ns/ffi-call)`);
    dl.close();
}
