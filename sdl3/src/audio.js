/**
 * SDL3 audio bindings: WAV loading and playback via audio streams.
 */

import { bufferToPointer, read } from 'tjs:ffi';

import { SDL, throwSDL } from './core.js';

const AUDIO_DEVICE_DEFAULT_PLAYBACK = 0xFFFFFFFF;


export class SDLAudio {
    static device = 0;

    static open() {
        SDLAudio.device = SDL.fns.SDL_OpenAudioDevice(AUDIO_DEVICE_DEFAULT_PLAYBACK, null);

        if (SDLAudio.device === 0) {
            throwSDL('SDL_OpenAudioDevice failed');
        }
    }

    static close() {
        if (SDLAudio.device) {
            SDL.fns.SDL_CloseAudioDevice(SDLAudio.device);
            SDLAudio.device = 0;
        }
    }

    /**
     * Load a WAV file from disk and return a Sound.
     */
    static loadWAV(path) {
        const specBuf = new Uint8Array(12);
        const specPtr = bufferToPointer(specBuf);

        const audioBufOut = new Uint8Array(8);
        const audioBufPtr = bufferToPointer(audioBufOut);

        const audioLenOut = new Uint8Array(4);
        const audioLenPtr = bufferToPointer(audioLenOut);

        const ok = SDL.fns.SDL_LoadWAV(path, specPtr, audioBufPtr, audioLenPtr);

        if (!ok) {
            throwSDL('SDL_LoadWAV failed');
        }

        const dataPtr = read.ptr(audioBufPtr, 0);
        const dataLen = read.u32(audioLenPtr, 0);

        return new Sound(specPtr, specBuf, dataPtr, dataLen);
    }
}


export class Sound {
    #specBuf;
    #specPtr;
    #dataPtr;
    #dataLen;
    #stream = null;
    #loop = false;

    constructor(specPtr, specBuf, dataPtr, dataLen) {
        this.#specPtr = specPtr;
        this.#specBuf = specBuf;
        this.#dataPtr = dataPtr;
        this.#dataLen = dataLen;
    }

    play({ loop = false } = {}) {
        this.#loop = loop;

        const fns = SDL.fns;

        if (!this.#stream) {
            this.#stream = fns.SDL_CreateAudioStream(this.#specPtr, null);

            if (this.#stream === null) {
                throwSDL('SDL_CreateAudioStream failed');
            }

            fns.SDL_BindAudioStream(SDLAudio.device, this.#stream);
        } else {
            fns.SDL_ClearAudioStream(this.#stream);
        }

        fns.SDL_PutAudioStreamData(this.#stream, this.#dataPtr, this.#dataLen);
    }

    /**
     * Call each frame to keep looping sounds fed.
     */
    update() {
        if (this.#loop && this.#stream) {
            const queued = SDL.fns.SDL_GetAudioStreamQueued(this.#stream);

            if (queued < this.#dataLen) {
                SDL.fns.SDL_PutAudioStreamData(this.#stream, this.#dataPtr, this.#dataLen);
            }
        }
    }

    stop() {
        if (this.#stream) {
            SDL.fns.SDL_ClearAudioStream(this.#stream);
        }
    }

    destroy() {
        if (this.#stream) {
            SDL.fns.SDL_DestroyAudioStream(this.#stream);
            this.#stream = null;
        }

        if (this.#dataPtr) {
            SDL.fns.SDL_free(this.#dataPtr);
            this.#dataPtr = null;
        }
    }
}
