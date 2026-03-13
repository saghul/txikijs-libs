/**
 * FFI call overhead benchmark.
 *
 * Measures raw call throughput for common FFI patterns used in SDL3 bindings.
 * Run: tjs run sdl3/bench-ffi.js
 */

import { dlopen, Lib, CFunction, types, suffix } from 'tjs:ffi';

const sopath = `./build/libffi-test.${suffix}`;

// --- Benchmark helper ---

function bench(name, fn, iterations = 1_000_000) {
    // Warmup
    for (let i = 0; i < 1000; i++) {
        fn();
    }

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        fn();
    }

    const elapsed = performance.now() - start;
    const opsPerSec = (iterations / elapsed * 1000).toFixed(0);
    const nsPerCall = ((elapsed / iterations) * 1e6).toFixed(0);

    console.log(`  ${name}: ${nsPerCall} ns/call (${opsPerSec} ops/sec)`);
}

// --- Setup: low-level CFunction API ---

const lib = new Lib(sopath);

const simple_func1 = new CFunction(lib.symbol('simple_func1'), types.sint, [ types.sint ]);
const parse_int = new CFunction(lib.symbol('parse_int'), types.sint, [ types.string ]);
const int_to_string = new CFunction(lib.symbol('int_to_string'), types.string, [ types.sint ]);

// --- Setup: dlopen API ---

const dl = dlopen(sopath, {
    simple_func1: { args: [ 'i32' ], returns: 'i32' },
    parse_int: { args: [ 'string' ], returns: 'i32' },
    int_to_string: { args: [ 'i32' ], returns: 'string' },
});

console.log('FFI Call Overhead Benchmark');
console.log('==========================\n');

console.log('CFunction.call() (low-level):');
bench('int -> int  (simple_func1)', () => simple_func1.call(42));
bench('string -> int (parse_int)', () => parse_int.call('1234'));
bench('int -> string (int_to_string)', () => int_to_string.call(345));

console.log('\ndlopen symbols (high-level):');
bench('int -> int  (simple_func1)', () => dl.symbols.simple_func1(42));
bench('string -> int (parse_int)', () => dl.symbols.parse_int('1234'));
bench('int -> string (int_to_string)', () => dl.symbols.int_to_string(345));

dl.close();
lib.close();
