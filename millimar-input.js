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
            node.isDataCbRegistered = node.libN1700Wrapper.registerDataCallback(onExtDataExtCallback, node.device.nChannels, [...Array(node.device.nChannels).keys()]);
            console.log(config.updateIntervalMs);
            if (config.updateIntervalMs > 0){
                this.hInterval = setInterval(node.libN1700Wrapper.readAllData, config.updateIntervalMs);
            }
    }


    node.on('input', function(msg) {
            msg.payload = String(msg.payload) + "  " + node.device.host;
            if (node.libN1700Wrapper  !== null) {
                node.libN1700Wrapper.readAllData()
            }
            node.send(msg);
        });



        node.on('close', function() {
            if (this.hInterval) {clearInterval(this.hInterval)};
            node.libN1700Wrapper.unregisterDataCallback();

        });
    }
    RED.nodes.registerType("millimar input",InputNode);
}