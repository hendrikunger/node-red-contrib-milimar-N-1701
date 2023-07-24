var koffi = require('koffi');
var ref = require('ref-napi');
var path = require('path');

var int = ref.types.int

var platform = process.platform
var n1700native = null
var mathlib = null
var primelib = null

if (platform === "win32") {
    if (process.arch === "ia32" || process.arch === "x86") {
        n1700native = "./lib/Win32/N1700.dll"
    }
    else if (process.arch === "x64") {
        n1700native = "./lib/Win64/N1700_64.dll"
    }
    else {
        throw new Error("unsupported architecture for n1700lib")
    }
    mathlib = "./lib/Win64/math.dll"
    primelib = "./lib/Win64/prime.dll"
} else if (platform === "linux") {
    //n1700native = "./math.so"
    throw new Error("unsupported plattform for n1700lib")
} else if (platform === "darwin") {
    //n1700native = "./math.dylib"
    throw new Error("unsupported plateform for n1700lib")
} else {
  throw new Error("unsupported plattform for n1700lib")
}


// Load the shared library
const libma = koffi.load(mathlib);

const add = libma.stdcall('add', 'int', ['int', 'int']);
const minus = libma.stdcall('minus', 'int', ['int', 'int']);

var result = null

result = add(5, 2)
console.log("5+2=" + result)

result = minus(5, 2)
console.log("5-2=" + result)



const n1700 = koffi.load("N1700_64");














// Load the shared library
const lib = koffi.load('user32.dll');

// Declare constants
const MB_OK = 0x0;
const MB_YESNO = 0x4;
const MB_ICONQUESTION = 0x20;
const MB_ICONINFORMATION = 0x40;
const IDOK = 1;
const IDYES = 6;
const IDNO = 7;

// Find functions
const MessageBoxA = lib.stdcall('MessageBoxA', 'int', ['void *', 'str', 'str', 'uint']);
const MessageBoxW = lib.stdcall('MessageBoxW', 'int', ['void *', 'str16', 'str16', 'uint']);

let ret = MessageBoxA(null, 'Do you want another message box?', 'Koffi', MB_YESNO | MB_ICONQUESTION);
if (ret == IDYES)
    MessageBoxW(null, 'Hello World!', 'Koffi', MB_ICONINFORMATION);





/*
var platform = process.platform
var n1700native = null
var mathlib = null
var primelib = null

if (platform === "win32") {
    if (process.arch === "ia32" || process.arch === "x86") {
        n1700native = "./lib/Win32/N1700.dll"
    }
    else if (process.arch === "x64") {
        n1700native = "./lib/Win32/N1700_64.dll"
    }
    else {
        throw new Error("unsupported architecture for n1700lib")
    }
    mathlib = "./lib/Win64/math.dll"
    primelib = "./lib/Win64/prime.dll"
} else if (platform === "linux") {
    //n1700native = "./math.so"
    throw new Error("unsupported plateform for n1700lib")
} else if (platform === "darwin") {
    //n1700native = "./math.dylib"
    throw new Error("unsupported plateform for n1700lib")
} else {
  throw new Error("unsupported plateform for n1700lib")
}

var math = ffi.Library(mathlib, {
  add: [int, [int, int]],
  minus: [int, [int, int]],
  multiply: [int, [int, int]],
})

var result = null

result = math.add(5, 2)
console.log("5+2=" + result)

result = math.minus(5, 2)
console.log("5-2=" + result)

result = math.multiply(5, 2)
console.log("5*2=" + result)


var ArrayType = require('ref-array-napi');
var IntArray = ArrayType(ref.types.int);
var a = new IntArray(20); // creates an integer array of size 10
console.log(a.length); // 10

var libprime = ffi.Library(primelib, {
    'getPrimes': [ int, [ int, IntArray] ]
  })

// var count = libprime.getPrimes(50, a);
// var primes = a.toArray().slice(0, count);

// console.log(primes);

var bool = ref.types.bool
var uint32 = ref.types.uint32
var uint32Ptr = ref.refType(uint32)
var int32 = ref.types.int32
n1700native = "./N1700_64.dll"
console.log(n1700native)

// Define the C function signature
const F_N1700InitializeLibrary = ffi.Function('int', ['bool', 'pointer', 'pointer', 'int32']);

// var RTLD_NOW = ffi.DynamicLibrary.FLAGS.RTLD_NOW;
// var RTLD_GLOBAL = ffi.DynamicLibrary.FLAGS.RTLD_GLOBAL;
// var mode = RTLD_NOW | RTLD_GLOBAL;
// var libs =  ffi.DynamicLibrary(n1700native, mode);

const  n1700 = ffi.Library(n1700native, {
    N1700InitializeLibrary: [ F_N1700InitializeLibrary, ['bool', 'pointer', 'pointer', 'int32'] ]
  })






//   test_ffi.set_a_callback(callback_function)

//   // Make an extra reference to the callback pointer to avoid GC
//   process.on('exit', function() {
//     callback_function
//   })

// In particular, it is important to make sure that the function has a reference in JS after setting up 
// the callback function (for example, a reference to the function is placed in the NodeJS exit event, which is a classic practice).
// Otherwise, the function will be destructured by the NodeJS GC. This happens when the program starts executing normally, but when 
// the callback function is called after a while, the program exits abnormally. If you use VS to debug the program, you will see that
// the program may have accessed an illegal pointer because the DLL code also stores the pointer to the callback function, but in JS
// the address pointed to by the pointer is not referenced by the code in JS, so it is freed by the CG, so when the code in the DLL
// calls the function at that address, it accesses illegal memory.


*/