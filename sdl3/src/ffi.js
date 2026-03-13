/**
 * Low-level FFI symbol definitions for SDL3, SDL3_image, and SDL3_ttf.
 */


const platform = navigator.userAgentData?.platform;

export function defaultPath(base) {
    return {
        macOS: `/opt/homebrew/lib/lib${base}.dylib`,
        Windows: `${base}.dll`,
    }[platform] ?? `lib${base}.so`;
}

export const SDL_SYMBOLS = {
    // Init / Quit
    SDL_Init:                   { args: [ 'u32' ],                                    returns: 'u8' },
    SDL_Quit:                   { args: [] },
    SDL_GetError:               { args: [],                                         returns: 'string' },
    SDL_GetTicks:               { args: [],                                         returns: 'u64' },
    SDL_Delay:                  { args: [ 'u32' ] },

    // Window
    SDL_CreateWindow:           { args: [ 'string', 'i32', 'i32', 'u64' ],            returns: 'ptr' },
    SDL_DestroyWindow:          { args: [ 'ptr' ] },
    SDL_SetWindowTitle:         { args: [ 'ptr', 'string' ],                          returns: 'u8' },
    SDL_SetWindowPosition:      { args: [ 'ptr', 'i32', 'i32' ],                      returns: 'u8' },
    SDL_SetWindowSize:          { args: [ 'ptr', 'i32', 'i32' ],                      returns: 'u8' },
    SDL_GetWindowSize:          { args: [ 'ptr', 'ptr', 'ptr' ],                      returns: 'u8' },
    SDL_SetWindowFullscreen:    { args: [ 'ptr', 'u8' ],                              returns: 'u8' },
    SDL_SetWindowResizable:     { args: [ 'ptr', 'u8' ],                              returns: 'u8' },
    SDL_SetWindowBordered:      { args: [ 'ptr', 'u8' ],                              returns: 'u8' },
    SDL_ShowWindow:             { args: [ 'ptr' ],                                    returns: 'u8' },
    SDL_HideWindow:             { args: [ 'ptr' ],                                    returns: 'u8' },
    SDL_RaiseWindow:            { args: [ 'ptr' ],                                    returns: 'u8' },

    // Renderer
    SDL_CreateRenderer:         { args: [ 'ptr', 'ptr' ],                             returns: 'ptr' },
    SDL_DestroyRenderer:        { args: [ 'ptr' ] },
    SDL_SetRenderDrawColor:     { args: [ 'ptr', 'u8', 'u8', 'u8', 'u8' ],           returns: 'u8' },
    SDL_RenderClear:            { args: [ 'ptr' ],                                    returns: 'u8' },
    SDL_RenderPresent:          { args: [ 'ptr' ],                                    returns: 'u8' },
    SDL_RenderPoint:            { args: [ 'ptr', 'f32', 'f32' ],                      returns: 'u8' },
    SDL_RenderLine:             { args: [ 'ptr', 'f32', 'f32', 'f32', 'f32' ],        returns: 'u8' },
    SDL_RenderRect:             { args: [ 'ptr', 'ptr' ],                             returns: 'u8' },
    SDL_RenderFillRect:         { args: [ 'ptr', 'ptr' ],                             returns: 'u8' },
    SDL_RenderTexture:          { args: [ 'ptr', 'ptr', 'ptr', 'ptr' ],               returns: 'u8' },
    SDL_SetRenderScale:         { args: [ 'ptr', 'f32', 'f32' ],                      returns: 'u8' },

    // Texture
    SDL_CreateTexture:          { args: [ 'ptr', 'u32', 'i32', 'i32', 'i32' ],        returns: 'ptr' },
    SDL_DestroyTexture:         { args: [ 'ptr' ] },
    SDL_UpdateTexture:          { args: [ 'ptr', 'ptr', 'buffer', 'i32' ],            returns: 'u8' },
    SDL_SetTextureColorMod:     { args: [ 'ptr', 'u8', 'u8', 'u8' ],                 returns: 'u8' },
    SDL_SetTextureAlphaMod:     { args: [ 'ptr', 'u8' ],                              returns: 'u8' },
    SDL_SetTextureBlendMode:   { args: [ 'ptr', 'u32' ],                             returns: 'u8' },
    SDL_SetTextureScaleMode:   { args: [ 'ptr', 'u32' ],                             returns: 'u8' },
    SDL_CreateTextureFromSurface: { args: [ 'ptr', 'ptr' ],                           returns: 'ptr' },

    // Surface
    SDL_LoadBMP:                { args: [ 'string' ],                                 returns: 'ptr' },
    SDL_DestroySurface:         { args: [ 'ptr' ] },

    // Events
    SDL_PollEvent:              { args: [ 'buffer' ],                                 returns: 'u8' },
    SDL_WaitEvent:              { args: [ 'buffer' ],                                 returns: 'u8' },
    SDL_WaitEventTimeout:       { args: [ 'buffer', 'i32' ],                          returns: 'u8' },

    // Keyboard
    SDL_GetKeyName:             { args: [ 'u32' ],                                    returns: 'string' },

    // Audio
    SDL_OpenAudioDevice:        { args: [ 'u32', 'ptr' ],                             returns: 'u32' },
    SDL_CloseAudioDevice:       { args: [ 'u32' ] },
    SDL_LoadWAV:                { args: [ 'string', 'ptr', 'ptr', 'ptr' ],            returns: 'u8' },
    SDL_CreateAudioStream:      { args: [ 'ptr', 'ptr' ],                             returns: 'ptr' },
    SDL_DestroyAudioStream:     { args: [ 'ptr' ] },
    SDL_BindAudioStream:        { args: [ 'u32', 'ptr' ],                             returns: 'u8' },
    SDL_PutAudioStreamData:     { args: [ 'ptr', 'ptr', 'i32' ],                      returns: 'u8' },
    SDL_GetAudioStreamQueued:   { args: [ 'ptr' ],                                    returns: 'i32' },
    SDL_ClearAudioStream:       { args: [ 'ptr' ],                                    returns: 'u8' },
    SDL_free:                   { args: [ 'ptr' ] },
};

export const IMG_SYMBOLS = {
    IMG_Load:           { args: [ 'string' ],             returns: 'ptr' },
    IMG_LoadTexture:    { args: [ 'ptr', 'string' ],      returns: 'ptr' },
};

export const TTF_SYMBOLS = {
    TTF_Init:                       { args: [],                                 returns: 'u8' },
    TTF_Quit:                       { args: [] },
    TTF_OpenFont:                   { args: [ 'string', 'f32' ],                  returns: 'ptr' },
    TTF_CloseFont:                  { args: [ 'ptr' ] },
    TTF_SetFontSize:                { args: [ 'ptr', 'f32' ],                     returns: 'u8' },
    TTF_GetFontSize:                { args: [ 'ptr' ],                            returns: 'f32' },
    TTF_SetFontStyle:               { args: [ 'ptr', 'u32' ] },
    TTF_GetFontStyle:               { args: [ 'ptr' ],                            returns: 'u32' },
    TTF_SetFontOutline:             { args: [ 'ptr', 'i32' ],                     returns: 'u8' },
    TTF_GetFontOutline:             { args: [ 'ptr' ],                            returns: 'i32' },
    TTF_GetFontHeight:              { args: [ 'ptr' ],                            returns: 'i32' },
    TTF_GetFontAscent:              { args: [ 'ptr' ],                            returns: 'i32' },
    TTF_GetFontDescent:             { args: [ 'ptr' ],                            returns: 'i32' },
    TTF_GetFontLineSkip:            { args: [ 'ptr' ],                            returns: 'i32' },
    TTF_FontIsFixedWidth:           { args: [ 'ptr' ],                            returns: 'u8' },
    TTF_GetFontFamilyName:          { args: [ 'ptr' ],                            returns: 'string' },
    TTF_GetFontStyleName:           { args: [ 'ptr' ],                            returns: 'string' },
    TTF_GetStringSize:              { args: [ 'ptr', 'string', 'u64', 'ptr', 'ptr' ], returns: 'u8' },
    // SDL_Color is 4 bytes (r,g,b,a) — passed as u32
    TTF_RenderText_Solid:           { args: [ 'ptr', 'string', 'u64', 'u32' ],    returns: 'ptr' },
    TTF_RenderText_Blended:         { args: [ 'ptr', 'string', 'u64', 'u32' ],    returns: 'ptr' },
    TTF_RenderText_Shaded:          { args: [ 'ptr', 'string', 'u64', 'u32', 'u32' ], returns: 'ptr' },
    TTF_RenderText_Blended_Wrapped: { args: [ 'ptr', 'string', 'u64', 'u32', 'i32' ], returns: 'ptr' },
};
