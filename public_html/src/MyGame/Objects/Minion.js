"use strict";


// TODO:: MinionFactory that spawns at some gPos and destroy function. Also, behavior once at target position
function Minion(pf, gSpawnPos) {
	this.sprite = new SpriteRenderable("assets/target.png");
	GameObject.call(this, this.sprite);

	this.health = 100;
	this.moveSpeed = 10;
	this.movementEnabled = true

	this.path = [1, 1];
	this.pathIndex = 0;
	this.curGridPos = gSpawnPos;

	this.pf = pf;
	this.graph = pf.graph;

	this.getXform().setPosition(gSpawnPos[0] * this.pf.nodeW + this.pf.nodeW / 2, 
								gSpawnPos[1] * -this.pf.nodeH - this.pf.nodeH / 2);
	this.getXform().setSize(this.pf.nodeW, this.pf.nodeH);

	this.updatePath([5, 5]);
}
gEngine.Core.inheritPrototype(Minion, GameObject);

Minion.prototype.update = function(dt) {
	if(!this.movementEnabled) return;

    var pos = this.getXform().getPosition();
    var targetPos = this.pf.GridIndexToWC(this.path[this.pathIndex].x, this.path[this.pathIndex].y);

    if(Math.round(pos[0]) === Math.round(targetPos[0]) && Math.round(pos[1]) === Math.round(targetPos[1])) {
    	if(this.pathIndex < this.path.length - 1) {
	    	this.pathIndex++;
	    	this.getNewDir();
    	} else { 
    		console.log("At target location");
    		this.movementEnabled = false;
    	}
    }
    var dir = this.getCurrentFrontDir();
    pos[0] += this.moveSpeed * dt * dir[0];
    pos[1] += this.moveSpeed * dt * dir[1];
};

Minion.prototype.updatePath = function(gPos) { 
    this.path = astar.search(this.graph,
            this.graph.grid[this.curGridPos[1]][this.curGridPos[0]],
            this.graph.grid[gPos[1]][gPos[0]], 
            null);
	this.getNewDir();
};

Minion.prototype.getNewDir = function() {
	var pos = this.getXform().getPosition();
    this.curGridPos = this.pf.WCToGridIndex(pos[0], pos[1]);
    var targetPos = [this.path[this.pathIndex].x * this.pf.nodeW * 1.5, this.path[this.pathIndex].y * this.pf.nodeH * -1.5];
    var targetGridPos = [this.path[this.pathIndex].x, this.path[this.pathIndex].y];

	this.setCurrentFrontDir([targetGridPos[0] - this.curGridPos[0], -(targetGridPos[1] - this.curGridPos[1])]);
};
