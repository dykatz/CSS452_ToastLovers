"use strict";

function Playfield(width, height, camRef) {
    this.cam = camRef;
    this.gWidth = width;
    this.gHeight = height;
    this.nodeW = this.cam.getWCWidth() / this.gWidth;
    this.nodeH = this.cam.getWCHeight() / this.gHeight;
    this.pfState = 0;
    
    this.toastCords = [Math.floor(width/2), Math.floor(height/2)];
    this.towers = new GameObjectSet();
    this.nodes = [];
    this.selectedTower = null;
    
    var tmpGraph = [];
    for(var i = 0; i < height; i++) {
        var tmp = new Array(width);
        tmp.fill(1, 0);        
        tmpGraph.push(tmp);
    }
    this.graph = new Graph(tmpGraph);
    this.path = [];
    this.nodes = [];
    this.initNodes();
    
    this.start = true;
    this.startIndex = [];
    this.endIndex = [];    
    this.lineRenderers = [];
};

Playfield.PlayfieldState = Object.freeze({
    pathDemo: 1,
    placementDemo: 2,
    deleteDemo: 3
});

Playfield.prototype.initNodes = function() {
    for(var i = 0; i < this.gWidth; i++) {
        for(var j = 0; j < this.gHeight; j++) {
            var x = i * this.nodeW + this.nodeW / 2;
            var y = -j * this.nodeH - this.nodeH / 2;
            var tmpRend = new Node([x, y], this.nodeW, this.nodeH);
            this.nodes.push(tmpRend);
        }
    }
    this.endIndex = [0, 0];
    this.startIndex = [0, 0];
    this.PlaceTower(this.toastCords, "Toast");
};

Playfield.prototype.draw = function(cam) {
    for(var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].draw(cam);
    }
    this.towers.draw(cam);
    for(var i = 0; i < this.lineRenderers.length; i++) 
    {
        this.lineRenderers[i].draw(cam);
    }
    if(this.selectedTower && this.pfState === Playfield.PlayfieldState.placementDemo)
        this.selectedTower.draw(cam);
};

Playfield.prototype.update = function()
{
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.One))
        this.pfState = Playfield.PlayfieldState.pathDemo;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Two))
        this.pfState = Playfield.PlayfieldState.placementDemo;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Three))
        this.pfState = Playfield.PlayfieldState.deleteDemo;
    
    if(this.cam.isMouseInViewport()) {
        var x = this.cam.mouseWCX();
        var y = this.cam.mouseWCY();
        var gridPos = this.WCToIndexs(x, y);
        var worldPos = this.IndexsToWC(gridPos[0], gridPos[1]);
        
        switch(this.pfState) {
            case Playfield.PlayfieldState.pathDemo:
                if (gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left)) {
                    if(this.start === true) {
                        this.startIndex = this.WCToIndexs(x, y);
                    } else {
                        this.endIndex = this.WCToIndexs(x, y);
                    }
                    this.start = !this.start;
                    this.UpdatePath();
                }    
                break;

            case Playfield.PlayfieldState.placementDemo:
                if(this.selectedTower === null) {
                    this.selectedTower = new Tower("assets/wall.png");
                    this.selectedTower.getXform().setPosition(-10, 0);  // Demo only case where it displays at 0,0
                    this.selectedTower.getXform().setSize(this.nodeW, this.nodeH);
                }               
                if(this.graph.grid[gridPos[1]][gridPos[0]].weight > 0) {
                    this.selectedTower.getXform().setPosition(worldPos[0], worldPos[1]);
                    if(gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left)) {
                        this.PlaceTower(gridPos);
                        //I think this will only be called when a tower actually gets created.
                        this.UpdatePath();
                    }
                }
                break;
            case Playfield.PlayfieldState.deleteDemo:
                if(gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left)) {
                    //Only redraw the path if a tower was actually deleted.
                    if(this.DeleteTower(gridPos))
                    {
                        this.UpdatePath();
                    }
                }
                break;
        }
    }
};

Playfield.prototype.WCToIndexs = function(x, y) {
    return [Math.floor(x / this.nodeW), Math.floor(-y / this.nodeH)];
};

Playfield.prototype.IndexsToWC = function(x, y) {
    return [Math.round(x) * this.nodeW + this.nodeW / 2, -Math.round(y) * this.nodeH - this.nodeH / 2];
};

Playfield.prototype.UpdatePath = function() 
{
    if(this.endIndex.length > 0 && this.startIndex.length > 0) 
    {
        //Get the path for drawing line.
        this.path = astar.search(this.graph, 
            this.graph.grid[this.startIndex[1]][this.startIndex[0]], 
            this.graph.grid[this.endIndex[1]][this.endIndex[0]], null);
        //Draw the line.
        this.DrawPath();
    }
};

Playfield.prototype.DrawPath = function() {
    if(this.path !== null) {
        this.lineRenderers = [];
        if(this.path.length > 0) {
            this.lineRenderers.push(new LineRenderable());
            var IndexWCPosition = this.IndexsToWC(this.startIndex[0], 
                this.startIndex[1]);
            this.lineRenderers[0].setFirstVertex(IndexWCPosition[0], 
                IndexWCPosition[1]);
            IndexWCPosition = this.IndexsToWC(this.path[0].y, this.path[0].x);
            this.lineRenderers[0].setSecondVertex(IndexWCPosition[0], 
                IndexWCPosition[1]);
            for(var i = 0; i < this.path.length - 1; i++) {
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

// Todo: Create "tower" class holding associated tower stats.
Playfield.prototype.PlaceTower = function(gPos) {
    var newTower;
    if(this.selectedTower === null) {
        newTower = new Toast("assets/target.png", gPos); // just for demo purposes
    } else {
        newTower = this.selectedTower;
        this.selectedTower.gridPos = gPos;
        this.selectedTower = null;
    }
    // Only 1x1 for now, will update later.
    newTower.getXform().setSize(this.nodeW * newTower.towerSize[0], this.nodeH * newTower.towerSize[1]);
    newTower.getXform().setPosition(gPos[0] * this.nodeW + this.nodeW / 2, 
                            -gPos[1] * this.nodeH - this.nodeH / 2);
    this.towers.addToSet(newTower);
    this.graph.grid[gPos[1]][gPos[0]].weight = 0;
};

Playfield.prototype.DeleteTower = function(gPos) {
    var index = this.towers.mSet.findIndex(tower => tower.gridPos[0] === gPos[0] && 
            tower.gridPos[1] === gPos[1] && !(tower instanceof Toast));
    if(index >= 0) {
        this.towers.removeAt(index);
        this.graph.grid[gPos[1]][gPos[0]].weight = 1;
        return true;
    }
    return false;
};
