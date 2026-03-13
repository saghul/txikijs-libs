/**
 * Core SDL3 bindings: SDL class, Window, Renderer, Texture, Surface, events.
 */

import { bufferToPointer, dlopen, read } from 'tjs:ffi';

import { INIT_VIDEO, INIT_EVENTS, EventType } from './constants.js';
import { defaultPath, SDL_SYMBOLS } from './ffi.js';


export class SDL {
    static lib = null;
    static fns = null;
    static #eventBuf = new Uint8Array(128);
    static #eventPtr = bufferToPointer(this.#eventBuf);

    static loadLibrary(path = defaultPath('SDL3')) {
        if (SDL.lib) {
            throw new Error('SDL3 library already loaded.');
        }

        SDL.lib = dlopen(path, SDL_SYMBOLS);
        SDL.fns = SDL.lib.symbols;
    }

    static init(flags = INIT_VIDEO | INIT_EVENTS) {
        if (!SDL.fns.SDL_Init(flags)) {
            throwSDL('SDL_Init failed');
        }
    }

    static quit() {
        SDL.fns.SDL_Quit();
        SDL.lib.close();
        SDL.lib = null;
        SDL.fns = null;
    }

    static getTicks() {
        return SDL.fns.SDL_GetTicks();
    }

    static delay(ms) {
        SDL.fns.SDL_Delay(ms);
    }

    static getKeyName(key) {
        return SDL.fns.SDL_GetKeyName(key);
    }

    static pollEvent() {
        if (SDL.fns.SDL_PollEvent(SDL.#eventBuf)) {
            return SDL.#parseEvent();
        }

        return null;
    }

    static waitEvent() {
        if (SDL.fns.SDL_WaitEvent(SDL.#eventBuf)) {
            return SDL.#parseEvent();
        }

        return null;
    }

    static waitEventTimeout(timeoutMs) {
        if (SDL.fns.SDL_WaitEventTimeout(SDL.#eventBuf, timeoutMs)) {
            return SDL.#parseEvent();
        }

        return null;
    }

    static *pollEvents() {
        const fns = SDL.fns;
        const buf = SDL.#eventBuf;

        while (fns.SDL_PollEvent(buf)) {
            yield SDL.#parseEvent();
        }
    }

    static #parseEvent() {
        const ptr = SDL.#eventPtr;
        const type = read.u32(ptr);
        const timestamp = Number(read.u64(ptr, 8));
        const base = { type, timestamp };

        switch (type) {
            case EventType.KEY_DOWN:
            case EventType.KEY_UP:
                return {
                    ...base,
                    windowID:   read.u32(ptr, 16),
                    scancode:   read.u32(ptr, 24),
                    key:        read.u32(ptr, 28),
                    mod:        read.u16(ptr, 32),
                    down:       read.u8(ptr, 36) !== 0,
                    repeat:     read.u8(ptr, 37) !== 0,
                };

            case EventType.MOUSE_MOTION:
                return {
                    ...base,
                    windowID:   read.u32(ptr, 16),
                    state:      read.u32(ptr, 24),
                    x:          read.f32(ptr, 28),
                    y:          read.f32(ptr, 32),
                    xrel:       read.f32(ptr, 36),
                    yrel:       read.f32(ptr, 40),
                };

            case EventType.MOUSE_BUTTON_DOWN:
            case EventType.MOUSE_BUTTON_UP:
                return {
                    ...base,
                    windowID:   read.u32(ptr, 16),
                    button:     read.u8(ptr, 24),
                    down:       read.u8(ptr, 25) !== 0,
                    clicks:     read.u8(ptr, 26),
                    x:          read.f32(ptr, 28),
                    y:          read.f32(ptr, 32),
                };

            case EventType.MOUSE_WHEEL:
                return {
                    ...base,
                    windowID:   read.u32(ptr, 16),
                    x:          read.f32(ptr, 24),
                    y:          read.f32(ptr, 28),
                };

            default:
                // Window events and others
                if (type >= 0x200 && type <= 0x2FF) {
                    return {
                        ...base,
                        windowID:   read.u32(ptr, 16),
                        data1:      read.i32(ptr, 20),
                        data2:      read.i32(ptr, 24),
                    };
                }

                return base;
        }
    }
}


export class Window {
    #ptr;
    #fns;
    #sizePtr;
    #sizePtr2;

    constructor(title, width = 800, height = 600, flags = 0n) {
        this.#fns = SDL.fns;
        const sizeBuf = new Uint8Array(8);

        this.#sizePtr = bufferToPointer(sizeBuf);
        this.#sizePtr2 = bufferToPointer(sizeBuf.subarray(4));
        this.#ptr = this.#fns.SDL_CreateWindow(title, width, height, Number(flags));

        if (this.#ptr === null) {
            throwSDL('SDL_CreateWindow failed');
        }
    }

    get pointer() {
        return this.#ptr;
    }

    createRenderer(name = null) {
        return new Renderer(this, name);
    }

    setTitle(title) {
        this.#fns.SDL_SetWindowTitle(this.#ptr, title);
    }

    setPosition(x, y) {
        this.#fns.SDL_SetWindowPosition(this.#ptr, x, y);
    }

    setSize(w, h) {
        this.#fns.SDL_SetWindowSize(this.#ptr, w, h);
    }

    getSize() {
        this.#fns.SDL_GetWindowSize(this.#ptr, this.#sizePtr, this.#sizePtr2);

        return { width: read.i32(this.#sizePtr), height: read.i32(this.#sizePtr2) };
    }

    setFullscreen(fullscreen) {
        this.#fns.SDL_SetWindowFullscreen(this.#ptr, fullscreen ? 1 : 0);
    }

    setResizable(resizable) {
        this.#fns.SDL_SetWindowResizable(this.#ptr, resizable ? 1 : 0);
    }

    setBordered(bordered) {
        this.#fns.SDL_SetWindowBordered(this.#ptr, bordered ? 1 : 0);
    }

    show() {
        this.#fns.SDL_ShowWindow(this.#ptr);
    }

    hide() {
        this.#fns.SDL_HideWindow(this.#ptr);
    }

    raise() {
        this.#fns.SDL_RaiseWindow(this.#ptr);
    }

    destroy() {
        if (this.#ptr) {
            this.#fns.SDL_DestroyWindow(this.#ptr);
            this.#ptr = null;
        }
    }
}


export class Renderer {
    #ptr;
    #fns;
    #frect = makeFrectPtr();
    #frect2 = makeFrectPtr();

    constructor(window, name = null) {
        this.#fns = SDL.fns;
        this.#ptr = this.#fns.SDL_CreateRenderer(window.pointer, name);

        if (this.#ptr === null) {
            throwSDL('SDL_CreateRenderer failed');
        }
    }

    get pointer() {
        return this.#ptr;
    }

    setDrawColor(r, g, b, a = 255) {
        this.#fns.SDL_SetRenderDrawColor(this.#ptr, r, g, b, a);
    }

    clear() {
        this.#fns.SDL_RenderClear(this.#ptr);
    }

    present() {
        this.#fns.SDL_RenderPresent(this.#ptr);
    }

    drawPoint(x, y) {
        this.#fns.SDL_RenderPoint(this.#ptr, x, y);
    }

    drawLine(x1, y1, x2, y2) {
        this.#fns.SDL_RenderLine(this.#ptr, x1, y1, x2, y2);
    }

    drawRect(x, y, w, h) {
        const { buf, ptr } = this.#frect;

        buf[0] = x; buf[1] = y; buf[2] = w; buf[3] = h;
        this.#fns.SDL_RenderRect(this.#ptr, ptr);
    }

    fillRect(x, y, w, h) {
        const { buf, ptr } = this.#frect;

        buf[0] = x; buf[1] = y; buf[2] = w; buf[3] = h;
        this.#fns.SDL_RenderFillRect(this.#ptr, ptr);
    }

    copy(texture, src = null, dst = null) {
        let srcPtr = null;
        let dstPtr = null;

        if (src) {
            const { buf, ptr } = this.#frect;

            buf[0] = src.x; buf[1] = src.y; buf[2] = src.w; buf[3] = src.h;
            srcPtr = ptr;
        }

        if (dst) {
            const { buf, ptr } = this.#frect2;

            buf[0] = dst.x; buf[1] = dst.y; buf[2] = dst.w; buf[3] = dst.h;
            dstPtr = ptr;
        }

        this.#fns.SDL_RenderTexture(this.#ptr, texture.pointer, srcPtr, dstPtr);
    }

    setScale(scaleX, scaleY) {
        this.#fns.SDL_SetRenderScale(this.#ptr, scaleX, scaleY);
    }

    createTexture(format, access, w, h) {
        return Texture.create(this, format, access, w, h);
    }

    createTextureFromSurface(surface) {
        const ptr = this.#fns.SDL_CreateTextureFromSurface(this.#ptr, surface.pointer);

        if (ptr === null) {
            throwSDL('SDL_CreateTextureFromSurface failed');
        }

        return new Texture(ptr);
    }

    destroy() {
        if (this.#ptr) {
            this.#fns.SDL_DestroyRenderer(this.#ptr);
            this.#ptr = null;
        }
    }
}


export class Texture {
    #ptr;
    #fns;
    #rect = makeRectPtr();

    constructor(ptr) {
        this.#fns = SDL.fns;
        this.#ptr = ptr;
    }

    static create(renderer, format, access, w, h) {
        const fns = SDL.fns;
        const ptr = fns.SDL_CreateTexture(renderer.pointer, format, access, w, h);

        if (ptr === null) {
            throwSDL('SDL_CreateTexture failed');
        }

        return new Texture(ptr);
    }

    get pointer() {
        return this.#ptr;
    }

    update(pixels, pitch, rect = null) {
        let rp = null;

        if (rect) {
            const { buf, ptr } = this.#rect;

            buf[0] = rect.x; buf[1] = rect.y; buf[2] = rect.w; buf[3] = rect.h;
            rp = ptr;
        }

        this.#fns.SDL_UpdateTexture(this.#ptr, rp, pixels, pitch);
    }

    setColorMod(r, g, b) {
        this.#fns.SDL_SetTextureColorMod(this.#ptr, r, g, b);
    }

    setAlphaMod(a) {
        this.#fns.SDL_SetTextureAlphaMod(this.#ptr, a);
    }

    setBlendMode(mode) {
        this.#fns.SDL_SetTextureBlendMode(this.#ptr, mode);
    }

    setScaleMode(mode) {
        this.#fns.SDL_SetTextureScaleMode(this.#ptr, mode);
    }

    destroy() {
        if (this.#ptr) {
            this.#fns.SDL_DestroyTexture(this.#ptr);
            this.#ptr = null;
        }
    }
}


export class Surface {
    #ptr;

    constructor(ptr) {
        this.#ptr = ptr;
    }

    get pointer() {
        return this.#ptr;
    }

    static loadBMP(path) {
        const ptr = SDL.fns.SDL_LoadBMP(path);

        if (ptr === null) {
            throwSDL(`SDL_LoadBMP failed for ${path}`);
        }

        return new Surface(ptr);
    }

    destroy() {
        if (this.#ptr) {
            SDL.fns.SDL_DestroySurface(this.#ptr);
            this.#ptr = null;
        }
    }
}


function makeFrectPtr() {
    const buf = new Float32Array(4);

    return { buf, ptr: bufferToPointer(new Uint8Array(buf.buffer)) };
}

function makeRectPtr() {
    const buf = new Int32Array(4);

    return { buf, ptr: bufferToPointer(new Uint8Array(buf.buffer)) };
}

export function throwSDL(msg) {
    throw new Error(`${msg}: ${SDL.fns.SDL_GetError()}`);
}
