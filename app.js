var koffi = require('koffi');
var ref = require('ref-napi');
var path = require('path');
const { Console } = require('console');
const { getMaxListeners } = require('events');

var int = ref.types.int

var platform = process.platform
var n1700native = null
var libPath = null

console.log('Running on Plattform %s with architecture %s', platform, process.arch)

if (platform === "win32") {
    if (process.arch === "ia32" || process.arch === "x86") {
        n1700native = "./lib/Win32/N1700"
        libPath = './lib/Win32/';
    }
    else if (process.arch === "x64") {
        n1700native = "./lib/Win64/N1700_64"
        libPath = './lib/Win64/';
    }
    else {
        throw new Error("unsupported architecture for n1700lib")
    }
} else if (platform === "linux") {
    //n1700native = "./math.so"
    throw new Error("unsupported plattform for n1700lib")
} else if (platform === "darwin") {
    //n1700native = "./math.dylib"
    throw new Error("unsupported plateform for n1700lib")
} else {
  throw new Error("unsupported plattform for n1700lib")
}



var oldPath = process.env.PATH;


process.env['PATH'] = `${process.env.PATH}${path.delimiter}${libPath}`;
const n1700 = koffi.load(n1700native);
process.env['PATH'] = oldPath;


var bool = ref.types.bool
var uint32 = ref.types.uint32
var uint32Ptr = ref.refType(uint32)
var int32 = ref.types.int32

                                           
const N1700InitializeLibrary = n1700.func('int __stdcall N1700InitializeLibrary(bool Console, _Out_ uint32 *NumModules, _Out_ uint32 *NumChannels, int32 Par)');
const N1700FreeLibrary  = n1700.func('int __stdcall N1700FreeLibrary()');
const N1700GetNumModules  = n1700.func('int __stdcall N1700GetNumModules()');
const N1700GetNumChannels  = n1700.func('int __stdcall N1700GetNumChannels()');
const N1700StartContinuousRequestAllData  = n1700.func('int __stdcall N1700StartContinuousRequestAllData(uint32 interval, int par)');
const N1700StopContinuousRequestAllData  = n1700.func('int __stdcall N1700StopContinuousRequestAllData()');
const N1700DataCallback = koffi.proto('int __stdcall N1700DataCallback(int numChannels, int *pChannelIdxArray, double* pData,void* pContext)');
const N1700RegisterDataCallback = n1700.func('int __stdcall N1700RegisterDataCallback(N1700DataCallback *pCallback, int numChannels, int *pChannelIdxArray, void *pContext)');
const N1700UnregisterDataCallback = n1700.func('int __stdcall N1700UnregisterDataCallback(N1700DataCallback *pCallback)');

// TODO: Write the callback function in JS
let cb_koffi_DataHandle = koffi.register(console.log, 'N1700DataCallback *');


let modules = [5];
let channels = [5];
var ret = -5;
ret = N1700InitializeLibrary(true, modules, channels, 0);

console.log("modules");
console.log("channels");
console.log("N1700InitializeLibrary: %s, Number of Modules: %s, Number of Channels: %s", ret, modules[0], channels[0]);


var ret = -5;
ret = N1700GetNumModules();
console.log("N1700GetNumModules ", ret);

var nChannels = -5;
nChannels = N1700GetNumChannels();
console.log("N1700GetNumChannels ", nChannels);

var ret = -5;
ret = N1700RegisterDataCallback(cb_koffi_DataHandle, nChannels, [0,1,2,3], 0);
console.log("N1700RegisterDataCallback ", ret);

var ret = -5;
ret = N1700StartContinuousRequestAllData(1, 1);
console.log("N1700StartContinuousRequestAllData ", ret);

setTimeout(CleanUp, 5000);




function CleanUp(){

    var ret = -5;
    ret = N1700StopContinuousRequestAllData();
    console.log("N1700StopContinuousRequestAllData ", ret);

    N1700UnregisterDataCallback(cb_koffi_DataHandle)
    
    koffi.unregister(cb_koffi_DataHandle);
    
    var ret = -5;
    ret = N1700FreeLibrary();
    console.log("N1700FreeLibrary ", ret);

}














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
