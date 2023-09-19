
libN1700Wrapper = require("./libN1700Wrapper");

module.exports = function(RED) {

    var g_nChannels = -1;

    function MillimarConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.libN1700Wrapper = libN1700Wrapper;
        this.nChannels = libN1700Wrapper.init();
        g_nChannels = this.nChannels;

        this.on('close', function() {
            libN1700Wrapper.destroy();
        });

    }
    RED.nodes.registerType("millimar-device-config",MillimarConfigNode);

    RED.httpAdmin.get("/nChannels", function(req,res) {
        res.json({ nChannels: g_nChannels });
    });
}