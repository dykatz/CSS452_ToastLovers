

function Playfield(width, height, camRef) {
    this.gWidth = width;
    this.gHeight = height;
    this.cam = camRef;
    
    this.toastCords = [width/2, height/2];
    
    var tmpGraph = [];
    for(var i = 0; i < height; i++) {
        var tmp = new Array(width);
        tmp.fill(1, 0);        
        tmpGraph.push(tmp);
    }
    tmpGraph[Math.ceil(this.toastCords[0])][Math.ceil(this.toastCords[1])] = 0;
    this.tempToast = new TextureRenderable("assets/target.png");
    this.graph = new Graph(tmpGraph);
    this.nodes = [];
    this.initNodes();
};

Playfield.prototype.initNodes = function() {
    var xGap = this.cam.getWCWidth() / this.gWidth;
    var yGap = this.cam.getWCHeight() / this.gHeight;
    for(var i = 0; i < this.gWidth; i++) {
        for(var j = 0; j < this.gHeight; j++) {
            var x = i * xGap + xGap / 2;
            var y = -j * yGap - yGap / 2;
            var tmpRend = new Node([x, y], xGap, yGap);
            this.nodes.push(tmpRend);
        }
    }
    this.tempToast.mXform.setSize(xGap, yGap);
    this.tempToast.mXform.setPosition(this.toastCords[0] * xGap, 
                                -this.toastCords[1] * yGap);
};

Playfield.prototype.draw = function() {
    for(var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].draw(this.cam);
    }
    this.tempToast.draw(this.cam);
};