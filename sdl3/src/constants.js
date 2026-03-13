/**
 * SDL3 constants: init flags, event types, window flags, pixel formats, key codes, font styles.
 */

// --- Init flags ---

export const INIT_AUDIO     = 0x00000010;
export const INIT_VIDEO     = 0x00000020;
export const INIT_JOYSTICK  = 0x00000200;
export const INIT_HAPTIC    = 0x00001000;
export const INIT_GAMEPAD   = 0x00002000;
export const INIT_EVENTS    = 0x00004000;
export const INIT_SENSOR    = 0x00008000;
export const INIT_CAMERA    = 0x00010000;


// --- Event types ---

export const EventType = Object.freeze({
    QUIT:                   0x100,
    // Window events
    WINDOW_SHOWN:           0x202,
    WINDOW_HIDDEN:          0x203,
    WINDOW_EXPOSED:         0x204,
    WINDOW_MOVED:           0x205,
    WINDOW_RESIZED:         0x206,
    WINDOW_MINIMIZED:       0x209,
    WINDOW_MAXIMIZED:       0x20a,
    WINDOW_RESTORED:        0x20b,
    WINDOW_MOUSE_ENTER:     0x20c,
    WINDOW_MOUSE_LEAVE:     0x20d,
    WINDOW_FOCUS_GAINED:    0x20e,
    WINDOW_FOCUS_LOST:      0x20f,
    WINDOW_CLOSE_REQUESTED: 0x210,
    // Keyboard events
    KEY_DOWN:               0x300,
    KEY_UP:                 0x301,
    TEXT_INPUT:             0x303,
    // Mouse events
    MOUSE_MOTION:           0x400,
    MOUSE_BUTTON_DOWN:      0x401,
    MOUSE_BUTTON_UP:        0x402,
    MOUSE_WHEEL:            0x403,
});


// --- Window flags ---

export const WindowFlags = Object.freeze({
    FULLSCREEN:         0x00000001n,
    OPENGL:             0x00000002n,
    HIDDEN:             0x00000008n,
    BORDERLESS:         0x00000010n,
    RESIZABLE:          0x00000020n,
    MINIMIZED:          0x00000040n,
    MAXIMIZED:          0x00000080n,
    HIGH_PIXEL_DENSITY: 0x00002000n,
    ALWAYS_ON_TOP:      0x00010000n,
});


// --- Pixel formats ---

export const PixelFormat = Object.freeze({
    RGBA8888: 0x16462004,
    ABGR8888: 0x16762004,
});

export const TextureAccess = Object.freeze({
    STATIC:     0,
    STREAMING:  1,
    TARGET:     2,
});


// --- Key codes (common subset) ---

export const Key = Object.freeze({
    UNKNOWN:    0x00000000,
    RETURN:     0x0000000d,
    ESCAPE:     0x0000001b,
    BACKSPACE:  0x00000008,
    TAB:        0x00000009,
    SPACE:      0x00000020,
    RIGHT:      0x4000004f,
    LEFT:       0x40000050,
    DOWN:       0x40000051,
    UP:         0x40000052,
    a: 0x61, b: 0x62, c: 0x63, d: 0x64, e: 0x65, f: 0x66, g: 0x67,
    h: 0x68, i: 0x69, j: 0x6a, k: 0x6b, l: 0x6c, m: 0x6d, n: 0x6e,
    o: 0x6f, p: 0x70, q: 0x71, r: 0x72, s: 0x73, t: 0x74, u: 0x75,
    v: 0x76, w: 0x77, x: 0x78, y: 0x79, z: 0x7a,
    0: 0x30, 1: 0x31, 2: 0x32, 3: 0x33, 4: 0x34,
    5: 0x35, 6: 0x36, 7: 0x37, 8: 0x38, 9: 0x39,
    F1:  0x4000003a, F2:  0x4000003b,
    F3:  0x4000003c, F4:  0x4000003d,
    F5:  0x4000003e, F6:  0x4000003f,
    F7:  0x40000040, F8:  0x40000041,
    F9:  0x40000042, F10: 0x40000043,
    F11: 0x40000044, F12: 0x40000045,
});


// --- Audio formats ---

export const AudioFormat = Object.freeze({
    U8:     0x0008,
    S8:     0x8008,
    S16:    0x8010,
    S32:    0x8020,
    F32:    0x8120,
});


// --- Scale modes ---

export const ScaleMode = Object.freeze({
    NEAREST:    0,
    LINEAR:     1,
});


// --- Blend modes ---

export const BlendMode = Object.freeze({
    NONE:   0x00000000,
    BLEND:  0x00000001,
    ADD:    0x00000002,
    MOD:    0x00000004,
    MUL:    0x00000008,
});


// --- Font styles ---

export const FontStyle = Object.freeze({
    NORMAL:         0x00,
    BOLD:           0x01,
    ITALIC:         0x02,
    UNDERLINE:      0x04,
    STRIKETHROUGH:  0x08,
});
