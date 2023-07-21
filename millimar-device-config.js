module.exports = function(RED) {
    function MillimarConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
    }
    RED.nodes.registerType("millimar-device-config",MillimarConfigNode);
}