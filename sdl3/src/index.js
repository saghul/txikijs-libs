/**
 * SDL3 bindings for txiki.js via FFI.
 *
 * ```js
 * import { SDL, Window, EventType } from './sdl3/index.js';
 *
 * SDL.loadLibrary();
 * SDL.init();
 * const window = new Window('Hello', 800, 600);
 * const renderer = window.createRenderer();
 * // ... event loop ...
 * renderer.destroy();
 * window.destroy();
 * SDL.quit();
 * ```
 */

export {
    INIT_AUDIO,
    INIT_VIDEO,
    INIT_JOYSTICK,
    INIT_HAPTIC,
    INIT_GAMEPAD,
    INIT_EVENTS,
    INIT_SENSOR,
    INIT_CAMERA,
    EventType,
    WindowFlags,
    PixelFormat,
    TextureAccess,
    Key,
    AudioFormat,
    ScaleMode,
    BlendMode,
    GamepadButton,
    GamepadAxis,
    FontStyle,
} from './constants.js';

export { SDL, Window, Renderer, Texture, Surface } from './core.js';
export { SDLAudio, Sound } from './audio.js';
export { Gamepad } from './gamepad.js';
export { SDLImage } from './image.js';
export { SDLTTF, Font } from './ttf.js';
