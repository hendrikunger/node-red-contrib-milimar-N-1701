libN1700Wrapper = require("./libN1700Wrapper");


function onExtDataExtCallback(data) {
    data.forEach(element => {
        console.log(element.ChannelIdx, element.dValue);
    });

}

function cleanUp(){
    if (hInterval) {clearInterval(hInterval)};
    libN1700Wrapper.unregisterDataCallback();
    libN1700Wrapper.destroy();
}


var nChannels = libN1700Wrapper.init();
libN1700Wrapper.registerDataCallback(onExtDataExtCallback, nChannels, [...Array(nChannels).keys()]);

setTimeout(cleanUp, 3000);
hInterval = setInterval(libN1700Wrapper.readAllData, 500);

