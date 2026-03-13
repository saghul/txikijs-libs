/**
 * SDL3_image bindings.
 */

import { dlopen } from 'tjs:ffi';

import { throwSDL, Surface, Texture } from './core.js';
import { defaultPath, IMG_SYMBOLS } from './ffi.js';


export class SDLImage {
    static lib = null;
    static fns = null;

    static loadLibrary(path = defaultPath('SDL3_image')) {
        if (SDLImage.lib) {
            throw new Error('SDL3_image library already loaded.');
        }

        SDLImage.lib = dlopen(path, IMG_SYMBOLS);
        SDLImage.fns = SDLImage.lib.symbols;
    }

    static loadSurface(path) {
        const ptr = SDLImage.fns.IMG_Load(path);

        if (ptr === null) {
            throwSDL(`IMG_Load failed for ${path}`);
        }

        return new Surface(ptr);
    }

    static loadTexture(renderer, path) {
        const ptr = SDLImage.fns.IMG_LoadTexture(renderer.pointer, path);

        if (ptr === null) {
            throwSDL(`IMG_LoadTexture failed for ${path}`);
        }

        return new Texture(ptr);
    }

    static close() {
        if (SDLImage.lib) {
            SDLImage.lib.close();
            SDLImage.lib = null;
            SDLImage.fns = null;
        }
    }
}
