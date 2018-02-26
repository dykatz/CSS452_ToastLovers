"use strict";

function Playfield(width, height, camRef)
{
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
    // Assuming the playfield we're using is odd #s, set up toast position
    tmpGraph[Math.ceil(this.toastCords[0])][Math.ceil(this.toastCords[1])] = 0;
    this.tempToast = null;
    this.graph = new Graph(tmpGraph);
    this.path = [];
    this.nodes = [];
    this.initNodes();
    this.start = true;

    this.startIndex = [];
    this.endIndex = [];
    
    this.lineRenderers = [];
};

Playfield.prototype.initNodes = function() {
    this.xGap = this.cam.getWCWidth() / this.gWidth; // Horizontal dist btwn Nodes
    this.yGap = this.cam.getWCHeight() / this.gHeight; // Vertical dist btwn Nodes
    for(var i = 0; i < this.gWidth; i++) {
        for(var j = 0; j < this.gHeight; j++) {
            var x = i * this.xGap + this.xGap / 2;
            var y = -j * this.yGap - this.yGap / 2;
            var tmpRend = new Node([x, y], this.xGap, this.yGap);
            this.nodes.push(tmpRend);
        }
    }
    this.tempToast = new TextureRenderable("assets/target.png");
    this.tempToast.mXform.setSize(this.xGap, this.yGap);
    this.tempToast.mXform.setPosition(this.toastCords[0] * this.xGap, 
                                -this.toastCords[1] * this.yGap);
    this.endIndex = [0, 0];
    this.startIndex = [0, 0];
};

Playfield.prototype.draw = function(cam) {
    for(var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].draw(cam);
    }
    this.tempToast.draw(cam);
    for(var i = 0; i < this.lineRenderers.length; i++) {
        this.lineRenderers[i].draw(cam);
    }
};

Playfield.prototype.update = function()
{
    if (gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left)) 
    {
        if (this.cam.isMouseInViewport()) 
        {
            var x = this.cam.mouseWCX();
            var y = this.cam.mouseWCY();
            if(this.start === true)
            {
                this.startIndex = this.WCToIndexs(x, y);
            }
            else
            {
                this.endIndex = this.WCToIndexs(x, y);
            }
            this.start = !this.start;
            if(this.endIndex.length > 0)
            {
                //Get the path for drawing line.
                this.path = astar.search(this.graph, 
                    this.graph.grid[this.startIndex[1]][this.startIndex[0]], 
                    this.graph.grid[this.endIndex[1]][this.endIndex[0]], null);
                //Draw the line.
                this.DrawPath();
            }
        }
    }
    
};

Playfield.prototype.WCToIndexs = function(x, y)
{
    return [Math.floor(x / this.xGap), Math.floor(-y / this.yGap)];
};

Playfield.prototype.IndexsToWC = function(x, y)
{
    return [x * this.xGap + this.xGap / 2, -y * this.yGap - this.yGap / 2];
};

Playfield.prototype.DrawPath = function()
{
    if(this.path !== null)
    {
        this.lineRenderers = [];
        if(this.path.length > 0)
        {
            this.lineRenderers.push(new LineRenderable());
            var IndexWCPosition = this.IndexsToWC(this.startIndex[0], 
                this.startIndex[1]);
            this.lineRenderers[0].setFirstVertex(IndexWCPosition[0], 
                IndexWCPosition[1]);
            IndexWCPosition = this.IndexsToWC(this.path[0].y, this.path[0].x);
            this.lineRenderers[0].setSecondVertex(IndexWCPosition[0], 
                IndexWCPosition[1]);
            for(var i = 0; i < this.path.length - 1; i++)
            {
                this.lineRenderers.push(new LineRenderable());
                IndexWCPosition = this.IndexsToWC(this.path[i].y, 
                    this.path[i].x);
                this.lineRenderers[i + 1].setFirstVertex(IndexWCPosition[0], 
                    IndexWCPosition[1]);
                IndexWCPosition = this.IndexsToWC(this.path[i + 1].y, 
                    this.path[i + 1].x);
                this.lineRenderers[i + 1].setSecondVertex(IndexWCPosition[0], 
                    IndexWCPosition[1]);
            }
        }
    }
};