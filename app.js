var koffi = require('koffi');
var ref = require('ref-napi');
var path = require('path');

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

const sN1700_Module  = koffi.struct('sN1700_Module',{ // 
	ModuleId: 'uint32',// The Id of the Modul, sequence number

	sFtDescription:  koffi.array('int', 40), // For internal use

	sFtSerial:  koffi.array('int', 12), // For internal use

	ModuleType: 'int', // Type of Module

	sModuleType:  koffi.array('int', 24), // Type of Module as string // 20171207 New Size

	sDescription:  koffi.array('int', 24) , // Name of Module as string, same as sModuleType // 20171207 New Size

	sIdentNo:  koffi.array('int', 8) , // Ident Number of Module

	sSerialNo:  koffi.array('int', 9) , // Serial Number of Module

	sFirmwareVersion: koffi.array('int', 10) ,  // Firmware Version number of Module

	ChannelCount: 'int' , // Count of Channels the module has

	PowerModuleNeeded: 'int' , // If TRUE (1), there is a Power Module needed at position before this Module

	PowerConsumption_mA: 'short'  , // Power Consumption of Module, negative if Consumption, positiv if Supply (USB-Modul, Power Module)

	ChannelIdxArray: koffi.array('uint32', 4)  // The Ids of the Channels included
});

const sN1700_Channel = koffi.struct('sN1700_Channel',{
	ChannelIdx: 'uint32',  // The Id of the Channel
	ParentModuleIdx: 'uint32' , // The Id of the Parent Module for accessing the Module-Parameters

	tPortType: 'int' , // Type of Channel-Port (ptAnalog, ptDigital)

	PortInCount: 'int' , // Count of Input Ports

	PortOutCount: 'int' , // Count of Output Ports

	Decimals: 'int' , // Count of decimals for PortType ptAnalog. Can be Changed with Call of N1700SetDecimal

	DigFilter: 'uint32' , // 20171207 New
	CustomerCalibActive: 'int' , // 20171207 New

	CustomerCalibrated: 'int' , // 20171207 New
	FactoryCalibrated: 'int'  // 20171207 New
});

const sN1700_ChannelExtData = koffi.struct('sN1700_ChannelExtData',{
	ChannelIdx: 'uint32',
	ValueType: 'int',
	Reserve1: koffi.array('int', 3) ,
	dValue: 'double',
	//        if Channel is an N 1704 I/O or N 17001 USB, the float value has to be converted to uint32,
	//        the low  2 bytes are the digital outputs(Bit 0x0000 0001 ist Port 1, Bit 0x0000 0002 ist Port 2...
	//        the high 2 bytes are the digital inputs (Bit 0x0001 0000 ist Port 1, Bit 0x0002 0000 ist Port 2...

	ReferenceActive: 'int',
	Referenced: 'int',

	Reserve2: koffi.array('int', 14)
});

const WM_USER = 1024;

// Messages
const WM_N1700_Tick = WM_USER + 2000 + 1
const WM_N1700_ModuleCountChanged = WM_USER + 2000 + 2
const WM_N1700_ChannelCountChanged = WM_USER + 2000 + 3
const WM_N1700_NewMeasVal = WM_USER + 2000 + 4
const WM_N1700_SendDataCallbacks = WM_USER + 2000 + 5
const WM_N1700_MwProSek = WM_USER + 2000 + 6
const WM_N1700_Switch = WM_USER + 2000 + 7
const WM_N1700_Communication = WM_USER + 2000 + 8
const WM_N1700_FirmwareUpdateProgress = WM_USER + 2000 + 9 // Param = Progress in 1/10 %
const WM_N1700_FirmwareUpdateError = WM_USER + 2000 + 10 // Param = Progress in
const WM_N1700_Debug = WM_USER + 2000 + 11
const WM_N1700_ChannelMwProSek = WM_USER + 2000 + 12
const WM_N1700_ChannelParChanged = WM_USER + 2000 + 13
const WM_N1700_Error = WM_USER + 2000 + 14
const WM_N1700_ErrorFlashInfo = WM_USER + 2000 + 15
const WM_N1700_AutoReset = WM_USER + 2000 + 16
const WM_N1700_PhaseCorrTimeoutSecs = WM_USER + 2000 + 17
const WM_N1700_PhaseCorrValue = WM_USER + 2000 + 18
const WM_N1700_RefStat = WM_USER + 2000 + 19 // 1: RefStat Ok, 0: RefStat Not Ok

                                           
const N1700InitializeLibrary = n1700.func('int __stdcall N1700InitializeLibrary(bool Console, _Out_ uint32 *NumModules, _Out_ uint32 *NumChannels, int32 Par)');
const N1700FreeLibrary  = n1700.func('int __stdcall N1700FreeLibrary()');
const N1700GetNumModules  = n1700.func('int __stdcall N1700GetNumModules()');
const N1700GetNumChannels  = n1700.func('int __stdcall N1700GetNumChannels()');
const N1700GetModule  = n1700.func('int __stdcall N1700GetModule(uint32 ModuleIdx, _Out_ sN1700_Module* Module)');
const N1700GetChannel  = n1700.func('int __stdcall N1700GetChannel(uint32 ChannelIdx, _Out_ sN1700_Channel* Channel)');
const N1700StartContinuousRequestAllData  = n1700.func('int __stdcall N1700StartContinuousRequestAllData(uint32 interval, int par)');
const N1700StopContinuousRequestAllData  = n1700.func('int __stdcall N1700StopContinuousRequestAllData()');
const N1700RequestData = n1700.func('int __stdcall N1700RequestData(int numChannels, uint32* pchannelIdxArray, int par)');
const N1700RequestAllData = n1700.func('int __stdcall N1700RequestAllData(int par)');

const N1700DataCallback = koffi.proto('int __stdcall N1700DataCallback (int numChannels, int *pChannelIdxArray, double* pData, int pContext)');
const N1700RegisterDataCallback= n1700.func('int __stdcall N1700RegisterDataCallback(N1700DataCallback *pCallback, int numChannels, int *pChannelIdxArray, int pContext)');
const N1700UnregisterDataCallback = n1700.func('int __stdcall N1700UnregisterDataCallback(N1700DataCallback *pCallback)');

function onDataCallback(numChannels, pChannelIdxArray, data, context) {
    console.log('onDataCallback', pChannelIdxArray, data);
    return 0;
}

const N1700ExtDataCallback = koffi.proto('int __stdcall N1700ExtDataCallback (int numData, sN1700_ChannelExtData* pData, int pContext)');
const N1700RegisterExtDataCallback = n1700.func('int __stdcall N1700RegisterExtDataCallback(N1700ExtDataCallback *pCallback, int numChannels, int *pChannelIdxArray, int pContext)');
const N1700UnregisterExtDataCallback = n1700.func('int __stdcall N1700UnregisterExtDataCallback(N1700ExtDataCallback *pCallback)');

function onDataExtCallback(numData, DataDict, context) {
    console.log('onDataExtCallback', channelIdxArray, data);
    return 0;
}

let cb_koffi_ExtDataHandle = koffi.register(onDataExtCallback, koffi.pointer(N1700ExtDataCallback));

const N1700MsgCallback = koffi.proto('int __stdcall N1700MsgCallback (int msg, uint32 Channel, int param)');
const N1700RegisterMsgCallback = n1700.func('int __stdcall N1700RegisterMsgCallback(N1700MsgCallback *pCallback)');
const N1700UnregisterMsgCallback = n1700.func('int __stdcall N1700UnregisterMsgCallback()');

function onMsgCallback(msg, Channel, param) {
	switch (msg) {
        case WM_N1700_Tick:
            console.log("WM_N1700_Tick\r\n");
            break;
        case WM_N1700_ModuleCountChanged:
            console.log("WM_N1700_ModuleCountChanged", Channel, param);
            break;
        case WM_N1700_ChannelCountChanged:
            console.log("WM_N1700_ChannelCountChanged", Channel, param);
            break;
        case WM_N1700_Communication:
            console.log("WM_N1700_Communication initialized.", Channel, param);
            break;
        case WM_N1700_NewMeasVal:
            //console.log("WM_N1700_NewMeasVal ", Channel, param);
            break;
        case WM_N1700_SendDataCallbacks:
            console.log("WM_N1700_SendDataCallbacks ", Channel, param);
            break;
        case WM_N1700_MwProSek:
            console.log("WM_N1700_MwProSek ", Channel, param);
            break;
        case WM_N1700_ChannelMwProSek:
            console.log("WM_N1700_ChannelMwProSek ", Channel, param);
            break;
        case WM_N1700_AutoReset:
            console.log("WM_N1700_AutoReset ", Channel, param);
            break;
        default:
            console.log("Unknown Message: ", msg, Channel, param);
        }

    return 0;
}
let cb_koffi_MsgHandle = koffi.register(onMsgCallback, koffi.pointer(N1700MsgCallback));


let modules = [5];
let channels = [5];

var ret = -5;
ret = N1700InitializeLibrary(true, modules, channels, 0);
console.log("N1700InitializeLibrary: %s, Number of Modules: %s, Number of Channels: %s", ret, modules[0], channels[0]);



var ret = -5;
ret = N1700GetNumModules();
console.log("N1700GetNumModules ", ret);

var nChannels = -5;
nChannels = N1700GetNumChannels();
console.log("N1700GetNumChannels ", nChannels);
//console.log(Array.from({length: nChannels - 1}, (_, i) => i + 1));

// var ret = -5;
// var channelInfo = {}
// ret = N1700GetChannel(7, channelInfo);
// console.log("N1700GetChannel ", ret);
// console.log(channelInfo);

// var ret = -5;
// var ids = [0,1,2,3];
// ret = N1700RegisterDataCallback(cb_koffi_DataHandle, 4, ids, 0);
// console.log("N1700RegisterDataCallback ", ret);

var ret = -5;
var ids = [0,1,2,3];
ret = N1700RegisterExtDataCallback(cb_koffi_ExtDataHandle, 4, ids, 0);
console.log("N1700RegisterExtDataCallback ", ret);


var ret = -5;
ret = N1700RegisterMsgCallback(cb_koffi_MsgHandle);
console.log("N1700RegisterMsgCallback ", ret);

console.log("Waiting 1000 ms")
setTimeout(StartReadData, 1000);


function StartReadData(){
    console.log("Waited 1000 ms")
    var ret = -5;
    ret = N1700RequestData(4, ids, 0);
    // ret = N1700StartContinuousRequestAllData(0, 0);
    console.log("N1700StartContinuousRequestAllData ", ret);
}





setTimeout(CleanUp, 3000);




function CleanUp(){

    var ret = -5;
    ret = N1700StopContinuousRequestAllData();
    console.log("N1700StopContinuousRequestAllData ", ret);

    // N1700UnregisterDataCallback(cb_koffi_DataHandle)
    N1700UnregisterExtDataCallback(cb_koffi_ExtDataHandle)
    N1700UnregisterMsgCallback(cb_koffi_MsgHandle)

        var ret = -5;
    ret = N1700FreeLibrary();
    console.log("N1700FreeLibrary ", ret);
    
    // koffi.unregister(cb_koffi_DataHandle);
    koffi.unregister(cb_koffi_ExtDataHandle);
    koffi.unregister(cb_koffi_MsgHandle);
    
    var ret = -5;
    ret = N1700FreeLibrary();
    console.log("N1700FreeLibrary ", ret);

}













