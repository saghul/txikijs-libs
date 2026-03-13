/**
 * SDL3_ttf bindings.
 */

import { bufferToPointer, dlopen, read } from 'tjs:ffi';

import { throwSDL, Surface } from './core.js';
import { defaultPath, TTF_SYMBOLS } from './ffi.js';


export class SDLTTF {
    static lib = null;
    static fns = null;

    static loadLibrary(path = defaultPath('SDL3_ttf')) {
        if (SDLTTF.lib) {
            throw new Error('SDL3_ttf library already loaded.');
        }

        SDLTTF.lib = dlopen(path, TTF_SYMBOLS);
        SDLTTF.fns = SDLTTF.lib.symbols;
    }

    static init() {
        if (!SDLTTF.fns.TTF_Init()) {
            throwSDL('TTF_Init failed');
        }
    }

    static quit() {
        if (SDLTTF.lib) {
            SDLTTF.fns.TTF_Quit();
            SDLTTF.lib.close();
            SDLTTF.lib = null;
            SDLTTF.fns = null;
        }
    }
}


export class Font {
    #ptr;
    #fns;
    #sizePtr;
    #sizePtr2;

    constructor(path, size) {
        this.#fns = SDLTTF.fns;
        const sizeBuf = new Uint8Array(8);

        this.#sizePtr = bufferToPointer(sizeBuf);
        this.#sizePtr2 = bufferToPointer(sizeBuf.subarray(4));
        this.#ptr = this.#fns.TTF_OpenFont(path, size);

        if (this.#ptr === null) {
            throwSDL(`TTF_OpenFont failed for ${path}`);
        }
    }

    get pointer() {
        return this.#ptr;
    }

    get size() {
        return this.#fns.TTF_GetFontSize(this.#ptr);
    }

    set size(ptsize) {
        this.#fns.TTF_SetFontSize(this.#ptr, ptsize);
    }

    get style() {
        return this.#fns.TTF_GetFontStyle(this.#ptr);
    }

    set style(flags) {
        this.#fns.TTF_SetFontStyle(this.#ptr, flags);
    }

    get outline() {
        return this.#fns.TTF_GetFontOutline(this.#ptr);
    }

    set outline(pixels) {
        this.#fns.TTF_SetFontOutline(this.#ptr, pixels);
    }

    get height() {
        return this.#fns.TTF_GetFontHeight(this.#ptr);
    }

    get ascent() {
        return this.#fns.TTF_GetFontAscent(this.#ptr);
    }

    get descent() {
        return this.#fns.TTF_GetFontDescent(this.#ptr);
    }

    get lineSkip() {
        return this.#fns.TTF_GetFontLineSkip(this.#ptr);
    }

    get isFixedWidth() {
        return !!this.#fns.TTF_FontIsFixedWidth(this.#ptr);
    }

    get familyName() {
        return this.#fns.TTF_GetFontFamilyName(this.#ptr);
    }

    get styleName() {
        return this.#fns.TTF_GetFontStyleName(this.#ptr);
    }

    measureText(text) {
        this.#fns.TTF_GetStringSize(this.#ptr, text, 0, this.#sizePtr, this.#sizePtr2);

        return { width: read.i32(this.#sizePtr), height: read.i32(this.#sizePtr2) };
    }

    renderSolid(text, r, g, b, a = 255) {
        const ptr = this.#fns.TTF_RenderText_Solid(this.#ptr, text, 0, packColor(r, g, b, a));

        if (ptr === null) {
            throwSDL('TTF_RenderText_Solid failed');
        }

        return new Surface(ptr);
    }

    renderBlended(text, r, g, b, a = 255) {
        const ptr = this.#fns.TTF_RenderText_Blended(this.#ptr, text, 0, packColor(r, g, b, a));

        if (ptr === null) {
            throwSDL('TTF_RenderText_Blended failed');
        }

        return new Surface(ptr);
    }

    renderShaded(text, fgR, fgG, fgB, bgR, bgG, bgB, fgA = 255, bgA = 255) {
        const ptr = this.#fns.TTF_RenderText_Shaded(
            this.#ptr, text, 0,
            packColor(fgR, fgG, fgB, fgA),
            packColor(bgR, bgG, bgB, bgA),
        );

        if (ptr === null) {
            throwSDL('TTF_RenderText_Shaded failed');
        }

        return new Surface(ptr);
    }

    renderWrapped(text, r, g, b, wrapWidth, a = 255) {
        const ptr = this.#fns.TTF_RenderText_Blended_Wrapped(
            this.#ptr, text, 0,
            packColor(r, g, b, a),
            wrapWidth,
        );

        if (ptr === null) {
            throwSDL('TTF_RenderText_Blended_Wrapped failed');
        }

        return new Surface(ptr);
    }

    close() {
        if (this.#ptr) {
            this.#fns.TTF_CloseFont(this.#ptr);
            this.#ptr = null;
        }
    }
}


function packColor(r, g, b, a = 255) {
    return (r | (g << 8) | (b << 16) | (a << 24)) >>> 0;
}
