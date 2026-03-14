/**
 * SDL3 gamepad bindings.
 */

import { bufferToPointer, read } from 'tjs:ffi';

import { SDL, throwSDL } from './core.js';


export class Gamepad {
    #ptr;

    constructor(instanceId) {
        this.#ptr = SDL.fns.SDL_OpenGamepad(instanceId);

        if (this.#ptr === null) {
            throwSDL('SDL_OpenGamepad failed');
        }
    }

    static hasGamepad() {
        return !!SDL.fns.SDL_HasGamepad();
    }

    static getGamepads() {
        const countBuf = new Uint8Array(4);
        const countPtr = bufferToPointer(countBuf);
        const listPtr = SDL.fns.SDL_GetGamepads(countPtr);

        if (listPtr === null) {
            return [];
        }

        const count = read.i32(countPtr, 0);
        const ids = [];

        for (let i = 0; i < count; i++) {
            ids.push(read.u32(listPtr, i * 4));
        }

        SDL.fns.SDL_free(listPtr);

        return ids;
    }

    get name() {
        return SDL.fns.SDL_GetGamepadName(this.#ptr);
    }

    get id() {
        return SDL.fns.SDL_GetGamepadID(this.#ptr);
    }

    get connected() {
        return !!SDL.fns.SDL_GamepadConnected(this.#ptr);
    }

    getButton(button) {
        return !!SDL.fns.SDL_GetGamepadButton(this.#ptr, button);
    }

    getAxis(axis) {
        return SDL.fns.SDL_GetGamepadAxis(this.#ptr, axis);
    }

    close() {
        if (this.#ptr) {
            SDL.fns.SDL_CloseGamepad(this.#ptr);
            this.#ptr = null;
        }
    }
}
