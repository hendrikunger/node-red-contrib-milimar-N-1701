module.exports = function(RED) {
    function InputNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Retrieve the config node
        this.device = RED.nodes.getNode(config.device);

        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase()+"  "+node.device.host;
            console.log(node.device.host);
            node.send(msg);
        });
    }
    RED.nodes.registerType("millimar input",InputNode);
}