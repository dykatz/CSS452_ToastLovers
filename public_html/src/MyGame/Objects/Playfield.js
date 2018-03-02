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
    this.minion = null;
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
};

Playfield.PlayfieldState = Object.freeze({
    inactive: 0,
    placementState: 1,
    deleteState: 2,
    grabState: 3
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
    this.selectedTower = new Toast();
    this.PlaceTower(this.toastCords);
    this.minion = new Minion(this, [0, 0]);
};

Playfield.prototype.draw = function(cam, drawGrid = true) {
    if(this.nodesActive && drawGrid)
        for(var i = 0; i < this.nodes.length; i++)
            this.nodes[i].draw(cam);

    this.towers.draw(cam);
    this.minion.draw(cam);
    if(this.selectedTower && this.pfState === Playfield.PlayfieldState.placementState && drawGrid)
        this.selectedTower.draw(cam);
};

Playfield.prototype.update = function(dt) {
    this.minion.update(dt);
    this.towers.update(dt);
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.R))
        this.pfState = Playfield.PlayfieldState.deleteState;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.W) 
    		&& this.pfState === Playfield.PlayfieldState.inactive)
    	this.pfState = Playfield.PlayfieldState.grabState;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.G))
        this.nodesActive = !this.nodesActive;
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Escape) && 
                    this.pfState === Playfield.PlayfieldState.placementState)
    this.CancelPlacement();
    
    if(this.cam.isMouseInViewport()) {
        var x = this.cam.mouseWCX();
        var y = this.cam.mouseWCY();
        var gridPos = this.WCToGridIndex(x, y);
        var worldPos = this.GridIndexToWC(gridPos[0], gridPos[1]);

        switch(this.pfState) {	            
            case Playfield.PlayfieldState.placementState:
                    if(this.selectedTower) {
                        this.selectedTower.update(dt);

                        if(this.graph.grid[gridPos[0]][gridPos[1]].weight === 1) {
                            this.selectedTower.getXform().setPosition(worldPos[0], worldPos[1]);
                            this.selectedTower.getRenderable().setColor([0.4,0.9,0.4,0.4]);

                            if(gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left))
                                this.PlaceTower(gridPos);
                        } else {
                            this.selectedTower.getRenderable().setColor([1, 0, 0, 0.5]);
                        }
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
};

Playfield.prototype.WCToGridIndex = function(x, y) {
    return [Math.floor(x / this.nodeW), Math.floor(-y / this.nodeH)];
};

Playfield.prototype.GridIndexToWC = function(x, y) {
    return [Math.round(x) * this.nodeW + this.nodeW / 2, -Math.round(y) * this.nodeH - this.nodeH / 2];
};

Playfield.prototype.PlaceTower = function(gPos) {
    var t = this.selectedTower;
    this.selectedTower = null;
    
    t.mGridPos = gPos;
    t.mFiringEnabled = true;
    t.getRenderable().setColor([1,1,1,0]);
    t.getXform().setSize(this.nodeW * t.mSize[0], this.nodeH * t.mSize[1]);
    t.getXform().setPosition(gPos[0] * this.nodeW + this.nodeW / 2, -gPos[1] * this.nodeH - this.nodeH / 2);
    
    this.towers.addToSet(t);    
    this.shop.completeTransaction(t);
    this.graph.grid[gPos[0]][gPos[1]].weight = t.mWeight;
    this.pfState = Playfield.PlayfieldState.inactive;
    this.OnPlayfieldModified();
};

Playfield.prototype.DeleteTower = function(gPos) {
    var i = this.GetTowerAtGridPos(gPos);
 
    if(i >= 0) {
        this.towers.removeAt(i);
        this.graph.grid[gPos[0]][gPos[1]].weight = 1;
        this.OnPlayfieldModified();
    }
    this.pfState = Playfield.PlayfieldState.inactive;
};

Playfield.prototype.GrabTower = function(gPos) {
    var i = this.GetTowerAtGridPos(gPos);
 
    if(i >= 0) {
    	this.selectedTower = this.towers.getObjectAt(i);
        this.selectedTower.mFiringEnabled = false;
        this.graph.grid[gPos[0]][gPos[1]].weight = 1;
        this.towers.removeAt(i);
        this.pfState = Playfield.PlayfieldState.placementState;
        this.OnPlayfieldModified();
    }
};

Playfield.prototype.CancelPlacement = function() {
    if(this.selectedTower.gridPos === null)
    	this.selectedTower = null;
    else 
    	this.PlaceTower(this.selectedTower.gridPos);
    this.pfState = Playfield.PlayfieldState.inactive;
};

Playfield.prototype.GetTowerAtGridPos = function(gPos) { 
    return this.towers.mSet.findIndex(tower => tower.gridPos[0] === gPos[0] && 
        tower.gridPos[1] === gPos[1] && !(tower instanceof Toast));
};

Playfield.prototype.OnPlayfieldModified = function () {
    //this.minions.forEach(minion => minion.updatePath(this.toastCords));
    if(this.minion !== null)
        this.minion.updatePath(this.toastCords);
};
