"use strict";

function Playfield(size, camRef, shop) {
	this.cam = camRef;
	this.gWidth = size[0];
	this.gHeight = size[1];
	this.nW = this.cam.getWCWidth() / this.gWidth;
	this.nH = this.cam.getWCHeight() / this.gHeight;
	this.pfState = Playfield.State.inactive;
	this.shop = shop;
	this.mProjectiles = new Set();

	this.toastCords = [Math.floor(this.gWidth/2), Math.floor(this.gHeight/2)];
	this.towers = new GameObjectSet();
	this.minions = new GameObjectSet();
	this.selectedTower = null;
	this.hoveredTower = null;
	this.minionFactory = new MinionFactory(this, MinionFactory.SpawnMode.entireBorder, 3);

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
	this.playerLost = false;
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

	this.selectedTower = new Toast();
	this.PlaceTower(this.toastCords);
};

Playfield.prototype.draw = function(cam, drawGrid = true) {
	this.towers.draw(cam);
	this.minions.draw(cam);
	this.mProjectiles.forEach(p => { p.draw(cam); });

	if(this.nodesActive && drawGrid)
		this.nodes.forEach(node => node.draw(cam));

	if(this.selectedTower && drawGrid && this.pfState === Playfield.State.placement)
		this.selectedTower.draw(cam);
};

Playfield.prototype.update = function(dt) {
	for(var i = 0; i < this.towers.size(); i++)
		this.towers.mSet[i].checkMinionsInRange(this.minions);

	this.towers.update(dt);
	this.minions.update(dt);
	this.minionFactory.update(dt);
	this.mProjectiles.forEach(p => { p.update(dt); });

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


		var hovered = this.GetTowerAtGridPos(gPos);
		if(!hovered) {
			if(this.hoveredTower)
				this.hoveredTower.showIndicator = false;
		} else if(!this.selectedTower) {
			if(this.hoveredTower)
				this.hoveredTower.showIndicator = false;

			this.hoveredTower = hovered
			this.hoveredTower.showIndicator = true;
		}


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

	for(var i = 0; i < this.minions.size(); ++i){
		this.CheckProjectileCollisions(this.minions.mSet[i]);

		if(this.minions.mSet[i].markedForDeletion){
			this.minions.removeAt(i);
			--i;
		}
	}

};

Playfield.prototype.getGridIndexWeight = function(x, y) {
	if(x < this.gWidth && y < this.gHeight)
	    return this.graph.grid[x][y].weight;
	return 1;
};

Playfield.prototype.CheckProjectileCollisions = function(collidingObject) {
	if(this.mProjectiles !== null)
		this.mProjectiles.forEach(p => { p.TryCollide(collidingObject); });
};

Playfield.prototype.WCToGridIndex = function(x, y) {
	return [Math.floor(x / this.nW), Math.floor(-y / this.nH)];
};

Playfield.prototype.GridIndexToWC = function(x, y) {
	return [Math.round(x) * this.nW + this.nW / 2, -Math.round(y) * this.nH - this.nH / 2];
};

Playfield.prototype.TowerPlacement = function(gPos) {
	if(gPos[0] < this.gWidth && gPos[1] < this.gHeight){
	    var wPos = this.GridIndexToWC(gPos[0], gPos[1]);

	    if(this.graph.grid[gPos[0]][gPos[1]].weight === 1) {
		    this.selectedTower.getXform().setPosition(wPos[0], wPos[1]);
		    this.selectedTower.getRenderable().setColor([0.4,0.9,0.4,0.4]);

		    if(gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left))
			    this.PlaceTower(gPos);
	    } else {
		    this.selectedTower.getRenderable().setColor([1, 0, 0, 0.5]);
	    }
	}
};

Playfield.prototype.PlaceTower = function(gPos) {
	if(gPos[0] < this.gWidth && gPos[1] < this.gHeight){
	    var t = this.selectedTower;
	    this.selectedTower = null;

	    t.mGridPos = gPos;
	    t.showIndicator = false;
	    t.mFiringEnabled = true;
	    t.getRenderable().setColor([1,1,1,0]);
	    t.getXform().setSize(this.nW * t.mSize[0], this.nH * t.mSize[1]);
	    t.getXform().setPosition(gPos[0] * this.nW + this.nW / 2, -gPos[1] * this.nH - this.nH / 2);

	    this.towers.addToSet(t);    
	    this.shop.completeTransaction(t);
	    this.graph.grid[gPos[0]][gPos[1]].weight = t.mWeight;
	    this.graph.grid[gPos[0]][gPos[1]].object = t;
	    this.pfState = Playfield.State.inactive;
	    this.OnPlayfieldModified();
	}
};

Playfield.prototype.DeleteTower = function(gPos) {
    if(gPos[0] < this.gWidth && gPos[1] < this.gHeight){
	var currentTower = this.GetTowerAtGridPos(gPos);
 
	if(currentTower !== null && !(currentTower instanceof Toast)) {
		this.shop.sellTower(currentTower);
		this.towers.removeAt(this.towers.mSet.findIndex(tower => tower.mGridPos[0] === gPos[0] && 
		    tower.mGridPos[1] === gPos[1]));
		this.graph.grid[gPos[0]][gPos[1]].weight = 1;
		this.graph.grid[gPos[0]][gPos[1]].object = null;
		this.OnPlayfieldModified();
	}

	this.pfState = Playfield.State.inactive;
    }
};

Playfield.prototype.GetTowerAtGridPos = function(gPos) { 
    if(gPos[0] < this.gWidth && gPos[1] < this.gHeight)
	return this.graph.grid[gPos[0]][gPos[1]].object;
    return null;
};

Playfield.prototype.DamageGridSpace = function(gPos, damageNumber) {
	var towerRef = this.GetTowerAtGridPos(gPos);
	if(towerRef !== null){
	    towerRef.takeDamage(damageNumber);
	    if(towerRef.markedForDeletion){
		if(!(towerRef instanceof Toast))
		    this.DeleteTower(gPos);
		else
		    this.playerLost = true;
	    }
	}
};

Playfield.prototype.GrabTower = function(gPos) {
	if(gPos[0] < this.gWidth && gPos[1] < this.gHeight){
	    var currentTower = this.GetTowerAtGridPos(gPos);

	    if(currentTower !== null && !(currentTower instanceof Toast)) {
		    this.selectedTower = currentTower;
		    this.selectedTower.mFiringEnabled = false;
		    this.graph.grid[gPos[0]][gPos[1]].weight = 1;
		    this.towers.remove(currentTower);
		    this.pfState = Playfield.State.placement;
		    this.OnPlayfieldModified();
	    }
	}
};

Playfield.prototype.CancelPlacement = function() {
	this.selectedTower.showIndicator = false;

	if(this.selectedTower.mGridPos)
		this.PlaceTower(this.selectedTower.mGridPos);
	else
		this.selectedTower = null;

	this.pfState = Playfield.State.inactive;
};

Playfield.prototype.OnPlayfieldModified = function () {
	this.minions.mSet.forEach(minion => minion.updatePath(this.toastCords));
};
