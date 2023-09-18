
libN1700Wrapper = require("./libN1700Wrapper");

module.exports = function(RED) {
    function MillimarConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
        this.libN1700Wrapper = libN1700Wrapper;
        this.nChannels = libN1700Wrapper.init();

        this.on('close', function() {
            libN1700Wrapper.destroy();
        });

    }
    RED.nodes.registerType("millimar-device-config",MillimarConfigNode);
}