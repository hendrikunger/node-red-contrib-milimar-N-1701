module.exports = function(RED) {
    let libN1700Wrapper = null;

    try {
    libN1700Wrapper = require("./libN1700Wrapper");
    } catch (e) {
       RED.log.error("[millimar-device-config] Could not load libN1700Wrapper: " + e.message);
    }
    var g_nChannels = -1;

    function MillimarConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.libN1700Wrapper = libN1700Wrapper;
        this.nChannels = libN1700Wrapper.init();
        g_nChannels = this.nChannels;

        this.on('close', function(removed, done) {
            // Defer destroy to allow any last unregister to finish
            setImmediate(() => {
                try { libN1700Wrapper.destroy(); }
                finally { done(); }
            });
        });
    }
    RED.nodes.registerType("millimar-device-config",MillimarConfigNode);

    RED.httpAdmin.get("/nChannels", function(req,res) {
        res.json({ nChannels: g_nChannels });
    });
}
