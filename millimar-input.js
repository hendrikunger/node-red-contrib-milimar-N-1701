module.exports = function(RED) {
    function InputNode(config) {
        RED.nodes.createNode(this,config);

        // Retrieve the config node
        this.device = RED.nodes.getNode(config.device);
        this.libN1700Wrapper = null;
        this.isDataCbRegistered = false;
        this.hInterval = null;
        // Save a reference to "this" for use in onDataReceivedFromC
        var node = this;


        function onExtDataExtCallback(data) {
            // data.forEach(element => {
            //     console.log(element.ChannelIdx, element.dValue);  
            // });
            var msg = {}
            msg.payload = data;
            node.send(msg);
            
        }

        if (node.device  !== null) {
            node.libN1700Wrapper = node.device.libN1700Wrapper;
            let channelList = config.channelPicker.split(',').map(Number);
            channelList.unshift(0);
            //node.isDataCbRegistered = node.libN1700Wrapper.registerDataCallback(onExtDataExtCallback, node.device.nChannels, [...Array(node.device.nChannels).keys()]);
            console.log("channelList: ", channelList, channelList.length);
            node.isDataCbRegistered = node.libN1700Wrapper.registerDataCallback(onExtDataExtCallback, channelList.length, channelList);
            if (config.updateIntervalMs > 0){
                this.hInterval = setInterval(node.libN1700Wrapper.readAllData, config.updateIntervalMs);
            }
    }


    node.on('input', function(msg) {
            if (node.libN1700Wrapper  !== null) {
                node.libN1700Wrapper.readAllData()
            }
            node.send(msg);
        });



    node.on('close', function(removed, done) {
         try {
             if (this.hInterval) { clearInterval(this.hInterval); }
             if (node.libN1700Wrapper) {
                 node.libN1700Wrapper.unregisterDataCallback();
             }
         } finally {
             done();
         }
     });
  }
    RED.nodes.registerType("millimar input",InputNode);
}