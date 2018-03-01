"use strict";

function Playfield(size, camRef, shop) {
    this.cam = camRef;
    this.gWidth = size[0];
    this.gHeight = size[1];
    this.nodeW = this.cam.getWCWidth() / this.gWidth;
    this.nodeH = this.cam.getWCHeight() / this.gHeight;
    this.pfState = Playfield.PlayfieldState.inactive;
    this.shop = shop;

    this.toastCords = [Math.floor(this.gWidth/2), Math.floor(this.gHeight/2)];
    this.towers = new GameObjectSet();
    this.nodes = [];
    this.nodesActive = true;
    this.selectedTower = null;
    
    var tmpGraph = [];
    for(var i = 0; i < this.gHeight; i++) {
        var tmp = new Array(this.gWidth);
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
	inactive: 0,
    pathDemo: 1,
    placementState: 2,
    deleteState: 3,
    grabState: 4
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
    this.selectedTower = new Toast();
    this.PlaceTower(this.toastCords);
};

Playfield.prototype.draw = function(cam, drawGrid = true) {
    if(this.nodesActive && drawGrid)
        for(var i = 0; i < this.nodes.length; i++)
            this.nodes[i].draw(cam);

    this.towers.draw(cam);

    for(var i = 0; i < this.lineRenderers.length; i++)
        this.lineRenderers[i].draw(cam);

    if(this.selectedTower && this.pfState === Playfield.PlayfieldState.placementState && drawGrid)
        this.selectedTower.draw(cam);
};

Playfield.prototype.update = function(dt) {
	console.log(this.pfState);
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Q))
        this.pfState = Playfield.PlayfieldState.pathDemo;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.R))
        this.pfState = Playfield.PlayfieldState.deleteState;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.W) 
    		&& this.pfState === Playfield.PlayfieldState.inactive)
    	this.pfState = Playfield.PlayfieldState.grabState;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.G))
        this.nodesActive = !this.nodesActive;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.D)) {
    	this.graph.diagonal = !this.graph.diagonal;
    	this.UpdatePath();
    }
  	if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Escape) && 
  			this.pfState === Playfield.PlayfieldState.placementState)
    	this.CancelPlacement();
    
    if(this.cam.isMouseInViewport()) {
        var x = this.cam.mouseWCX();
        var y = this.cam.mouseWCY();
        var gridPos = this.WCToGridIndex(x, y);
        var worldPos = this.GridIndexToWC(gridPos[0], gridPos[1]);

	    switch(this.pfState) {

	        case Playfield.PlayfieldState.pathDemo:
	            if (gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left)) {
	                if(this.start)
	                    this.startIndex = this.WCToGridIndex(x, y);
	                else
	                    this.endIndex = this.WCToGridIndex(x, y);

	                this.start = !this.start;
	                this.UpdatePath();
	            }
	            break;
	            
	        case Playfield.PlayfieldState.placementState:
	        	if(this.selectedTower) {
	                if(this.graph.grid[gridPos[1]][gridPos[0]].weight > 0) {
	                    this.selectedTower.getXform().setPosition(worldPos[0], worldPos[1]);
	                    this.selectedTower.getRenderable().setColor([0.4,0.9,0.4,0.4]);
	                    
	                    if(gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left))
	                        this.PlaceTower(gridPos);
	                } else
	                	this.selectedTower.getRenderable().setColor([1, 0, 0, 0.5]);
	        	}
	            break;

	        case Playfield.PlayfieldState.deleteState:
	            if(gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left))
	                this.DeleteTower(gridPos);
	            break;

	       	case Playfield.PlayfieldState.grabState:
	            if(gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left))
	                this.GrabTower(gridPos);
	            break;
	    }
	}
    this.towers.update(dt);
};

Playfield.prototype.WCToGridIndex = function(x, y) {
    return [Math.floor(x / this.nodeW), Math.floor(-y / this.nodeH)];
};

Playfield.prototype.GridIndexToWC = function(x, y) {
    return [Math.round(x) * this.nodeW + this.nodeW / 2, -Math.round(y) * this.nodeH - this.nodeH / 2];
};

Playfield.prototype.UpdatePath = function() {
    if(this.endIndex.length > 0 && this.startIndex.length > 0) {
        if(this.graph.diagonal)
	        this.path = astar.search(this.graph,
	            this.graph.grid[this.startIndex[1]][this.startIndex[0]],
	            this.graph.grid[this.endIndex[1]][this.endIndex[0]], null);
    	else
	        this.path = astar.search(this.graph,
	            this.graph.grid[this.startIndex[1]][this.startIndex[0]],
	            this.graph.grid[this.endIndex[1]][this.endIndex[0]],
	            { heuristic: astar.heuristics.diagonal });

        this.DrawPath();
    }
};

Playfield.prototype.DrawPath = function() {
    if(this.path !== null) {
        this.lineRenderers = [];

        if(this.path.length > 0) {
            this.lineRenderers.push(new LineRenderable());
            this.lineRenderers[0].setColor([1,0,0,1]);
            var IndexWCPosition = this.GridIndexToWC(this.startIndex[0], this.startIndex[1]);
            this.lineRenderers[0].setFirstVertex(IndexWCPosition[0], IndexWCPosition[1]);
            IndexWCPosition = this.GridIndexToWC(this.path[0].y, this.path[0].x);
            this.lineRenderers[0].setSecondVertex(IndexWCPosition[0], IndexWCPosition[1]);

            for(var i = 0; i < this.path.length - 1; i++) {
                this.lineRenderers.push(new LineRenderable());
                this.lineRenderers[i + 1].setColor([1,0,0,1]);
                IndexWCPosition = this.GridIndexToWC(this.path[i].y, this.path[i].x);
                this.lineRenderers[i + 1].setFirstVertex(IndexWCPosition[0], IndexWCPosition[1]);
                IndexWCPosition = this.GridIndexToWC(this.path[i + 1].y, this.path[i + 1].x);
                this.lineRenderers[i + 1].setSecondVertex(IndexWCPosition[0], IndexWCPosition[1]);
            }
        }
    }
};

Playfield.prototype.PlaceTower = function(gPos) {
    var newTower = this.selectedTower;
    this.selectedTower = null;

    newTower.getRenderable().setColor([1,1,1,0]);
    newTower.getXform().setSize(this.nodeW * newTower.towerSize[0], this.nodeH * newTower.towerSize[1]);
    newTower.gridPos = gPos;
    newTower.getXform().setPosition(gPos[0] * this.nodeW + this.nodeW / 2, 
                            -gPos[1] * this.nodeH - this.nodeH / 2);
    newTower.mFiringEnabled = true;
    this.towers.addToSet(newTower);    
    this.shop.completeTransaction(newTower);
    this.graph.grid[gPos[1]][gPos[0]].weight = 0;
    this.pfState = Playfield.PlayfieldState.inactive;
    this.UpdatePath();
};

Playfield.prototype.DeleteTower = function(gPos) {
    var index = this.towers.mSet.findIndex(tower => tower.gridPos[0] === gPos[0] && 
            tower.gridPos[1] === gPos[1] && !(tower instanceof Toast));
 
    if(index >= 0) {
        this.towers.removeAt(index);
        this.graph.grid[gPos[1]][gPos[0]].weight = 1;
        this.UpdatePath();
    }
    this.pfState = Playfield.PlayfieldState.inactive;
};

Playfield.prototype.GrabTower = function(gPos) {
    var index = this.towers.mSet.findIndex(tower => tower.gridPos[0] === gPos[0] && 
            tower.gridPos[1] === gPos[1] && !(tower instanceof Toast));
 
    if(index >= 0) {
    	this.selectedTower = this.towers.getObjectAt(index);
        this.towers.removeAt(index);
        this.graph.grid[gPos[1]][gPos[0]].weight = 1;
        this.UpdatePath();
        this.selectedTower.mFiringEnabled = false;
        this.pfState = Playfield.PlayfieldState.placementState;
    }
};

Playfield.prototype.CancelPlacement = function() {
    if(this.selectedTower.gridPos == null)
    	this.selectedTower = null;
	else 
    	this.PlaceTower(this.selectedTower.gridPos);

   	this.pfState = 0;
};
