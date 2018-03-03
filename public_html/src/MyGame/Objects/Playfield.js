"use strict";

function Playfield(size, camRef, shop) {
    this.cam = camRef;
    this.gWidth = size[0];
    this.gHeight = size[1];
    this.nW = this.cam.getWCWidth() / this.gWidth;
    this.nH = this.cam.getWCHeight() / this.gHeight;
    this.pfState = Playfield.State.inactive;
    this.shop = shop;

    this.toastCords = [Math.floor(this.gWidth/2), Math.floor(this.gHeight/2)];
    this.towers = new GameObjectSet();
    this.minions = new GameObjectSet();
   
    this.selectedTower = null;
    
    var tmpGraph = [];
    for(var i = 0; i < this.gWidth; i++) {
        var tmp = new Array(this.gHeight);
        tmp.fill(1, 0);        
        tmpGraph.push(tmp);
    }
    this.graph = new Graph(tmpGraph);
    this.nodes = [];
    this.nodesActive = true;
    this.initNodes();
};

Playfield.State = Object.freeze({
    inactive: 0,
    placement: 1,
    deletion: 2,
    grab: 3
});

Playfield.prototype.initNodes = function() {
    for(var i = 0; i < this.gWidth; i++) {
        for(var j = 0; j < this.gHeight; j++) {
            var x = i * this.nW + this.nW / 2;
            var y = -j * this.nH - this.nH / 2;
            var tmpRend = new Node([x, y], this.nW, this.nH);
            this.nodes.push(tmpRend);
        }
    }
    console.log(this.graph.toString());
    this.selectedTower = new Toast();
    this.PlaceTower(this.toastCords);
    this.minions.addToSet(new Minion(this, [0, 0]));
    this.minions.addToSet(new Minion(this, [30, 0]));
    this.minions.addToSet(new Minion(this, [0, 20]));
    this.minions.addToSet(new Minion(this, [30, 20]));
    this.minions.addToSet(new Minion(this, [0, 10]));
    this.minions.addToSet(new Minion(this, [30, 10]));
};

Playfield.prototype.draw = function(cam, drawGrid = true) {
    this.towers.draw(cam);
    this.minions.draw(cam);
    
    if(this.nodesActive && drawGrid)
        this.nodes.forEach(node => node.draw(cam));
    
    if(this.selectedTower && drawGrid && this.pfState === Playfield.State.placement)
        this.selectedTower.draw(cam);
};

Playfield.prototype.update = function(dt) {
    this.towers.update(dt);
    this.minions.update(dt);
    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.R))
        this.pfState = Playfield.State.deletion;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.W) && this.pfState === Playfield.State.inactive)
    	this.pfState = Playfield.State.grab;
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.G))
        this.nodesActive = !this.nodesActive;    
    if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Escape) && this.pfState === Playfield.State.placement)
        this.CancelPlacement();
    
    if(this.cam.isMouseInViewport()) {
        var x = this.cam.mouseWCX(), y = this.cam.mouseWCY();
        var gPos = this.WCToGridIndex(x, y);

        switch(this.pfState) {	            
            case Playfield.State.placement:
                if(this.selectedTower) {
                    this.selectedTower.update(dt);
                    this.TowerPlacement(gPos);
                }
                break;

            case Playfield.State.deletion:
                if(gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left))
                    this.DeleteTower(gPos);
                break;

            case Playfield.State.grab:
                if(gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left))
                    this.GrabTower(gPos);
                break;
        }
    }
};

Playfield.prototype.WCToGridIndex = function(x, y) {
    return [Math.floor(x / this.nW), Math.floor(-y / this.nH)];
};

Playfield.prototype.GridIndexToWC = function(x, y) {
    return [Math.round(x) * this.nW + this.nW / 2, -Math.round(y) * this.nH - this.nH / 2];
};

Playfield.prototype.TowerPlacement = function(gPos) {
    var wPos = this.GridIndexToWC(gPos[0], gPos[1]);

    if(this.graph.grid[gPos[0]][gPos[1]].weight === 1) {
        this.selectedTower.getXform().setPosition(wPos[0], wPos[1]);
        this.selectedTower.getRenderable().setColor([0.4,0.9,0.4,0.4]);

        if(gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left))
            this.PlaceTower(gPos);
    } else {
        this.selectedTower.getRenderable().setColor([1, 0, 0, 0.5]);
    }
};

Playfield.prototype.PlaceTower = function(gPos) {
    var t = this.selectedTower;
    this.selectedTower = null;
    
    t.mGridPos = gPos;
    t.mFiringEnabled = true;
    t.getRenderable().setColor([1,1,1,0]);
    t.getXform().setSize(this.nW * t.mSize[0], this.nH * t.mSize[1]);
    t.getXform().setPosition(gPos[0] * this.nW + this.nW / 2, -gPos[1] * this.nH - this.nH / 2);
    
    this.towers.addToSet(t);    
    this.shop.completeTransaction(t);
    this.graph.grid[gPos[0]][gPos[1]].weight = t.mWeight;
    this.pfState = Playfield.State.inactive;
    this.OnPlayfieldModified();
};

Playfield.prototype.DeleteTower = function(gPos) {
    var i = this.GetTowerAtGridPos(gPos);
 
    if(i >= 0) {
        this.towers.removeAt(i);
        this.graph.grid[gPos[0]][gPos[1]].weight = 1;
        this.OnPlayfieldModified();
    }
    this.pfState = Playfield.State.inactive;
};

Playfield.prototype.GrabTower = function(gPos) {
    var i = this.GetTowerAtGridPos(gPos);
 
    if(i >= 0) {
    	this.selectedTower = this.towers.getObjectAt(i);
        this.selectedTower.mFiringEnabled = false;
        this.graph.grid[gPos[0]][gPos[1]].weight = 1;
        this.towers.removeAt(i);
        this.pfState = Playfield.State.placement;
        this.OnPlayfieldModified();
    }
};

Playfield.prototype.CancelPlacement = function() {
    if(this.selectedTower.mGridPos === null)
    	this.selectedTower = null;
    else 
    	this.PlaceTower(this.selectedTower.mGridPos);
    this.pfState = Playfield.State.inactive;
};

Playfield.prototype.GetTowerAtGridPos = function(gPos) { 
    return this.towers.mSet.findIndex(tower => tower.mGridPos[0] === gPos[0] && 
        tower.mGridPos[1] === gPos[1] && !(tower instanceof Toast));
};

Playfield.prototype.OnPlayfieldModified = function () {
    this.minions.mSet.forEach(minion => minion.updatePath(this.toastCords));
};
