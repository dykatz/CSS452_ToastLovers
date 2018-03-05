"use strict";


// TODO:: MinionFactory that spawns at some gPos and destroy function. Also, behavior once at target position
function Minion(pf, gSpawnPos) {
    this.mRenderComponent = new SpriteRenderable("assets/target.png");
    GameObject.call(this, this.mRenderComponent);
    
    this.pf = pf;
    this.graph = pf.graph;
    this.gPos = gSpawnPos;
    
    this.mHealth = 100;
    this.mSpeed = 10;
    this.movementEnabled = true;

    this.path = [];
    this.pathIndex = 0;
    this.pathLine = [];
    this.drawPath = true;

    this.getXform().setSize(this.pf.nW, this.pf.nH);
    this.getXform().setPosition(this.gPos[0] * pf.nW + pf.nW / 2, this.gPos[1] * -pf.nH - pf.nH / 2);
    this.updatePath(this.pf.toastCords);
    this.markedForDeletion = false;
}
gEngine.Core.inheritPrototype(Minion, GameObject);

Minion.prototype.update = function(dt) {
    if(!this.movementEnabled) return;

    var pos = this.getXform().getPosition();
    
    this.gPos = this.pf.WCToGridIndex(pos[0], pos[1]);
    var targetGridPos = [this.path[this.pathIndex].x, this.path[this.pathIndex].y];
    var targetPos = this.pf.GridIndexToWC(targetGridPos[0], targetGridPos[1]);
    
    var dir = this.getCurrentFrontDir();
    pos[0] += this.mSpeed * dt * dir[0];
    pos[1] += this.mSpeed * dt * dir[1];
    
    var xAligned = Math.round(pos[0]) === Math.round(targetPos[0]);
    var yAligned = Math.round(pos[1]) === Math.round(targetPos[1]);
    
    if(dir[0] !== 0 && !yAligned || dir[1] !== 0 && !xAligned)
        this.setCurrentFrontDir([targetPos[0] - pos[0], targetPos[1] - pos[1]]);
        
    if(dir[0] !== 0 && xAligned || dir[1] !== 0 && yAligned) {
    	if(this.pathIndex < this.path.length - 1) {
            this.pathIndex++;
            this.getNewDir();
    	} else { 
            console.log("Reached Target location. Do something now.");
            this.pathLine = [];
            this.movementEnabled = false;
    	}
    }
};

Minion.prototype.draw = function(cam) {
    GameObject.prototype.draw.call(this, cam);
    
    if(this.drawPath)
        this.pathLine.forEach(line => line.draw(cam));
};

Minion.prototype.updatePath = function(gPos) { 
    this.path = astar.search(this.graph,
        this.graph.grid[this.gPos[0]][this.gPos[1]],
        this.graph.grid[gPos[0]][gPos[1]], null);
        
    this.pathIndex = 0;
    this.getNewDir();
    
    if(this.drawPath && this.path.length > 0)
        this.DrawPath();
};

Minion.prototype.getNewDir = function() {
    var targetGridPos = [this.path[this.pathIndex].x, this.path[this.pathIndex].y];
    this.setCurrentFrontDir([targetGridPos[0] - this.gPos[0], -(targetGridPos[1] - this.gPos[1])]);        
};

Minion.prototype.DrawPath = function() {
    this.pathLine = [];
    
    var from = this.pf.GridIndexToWC(this.gPos[0], this.gPos[1]);
    var to = this.pf.GridIndexToWC(this.path[0].x, this.path[0].y);
    this.DrawLine(from, to, [1,0,0,1]);
    
    for(var i = 0; i < this.path.length - 1; i++) {
        from = this.pf.GridIndexToWC(this.path[i].x, this.path[i].y);
        to = this.pf.GridIndexToWC(this.path[i + 1].x, this.path[i + 1].y);
        this.DrawLine(from, to, [1,0,0,1]);
    }
};

Minion.prototype.TakeDamage = function(damageValue) {
    this.mHealth -= damageValue;
    if(this.mHealth <= 0)
    {
        this.markedForDeletion = true;
    }
};

Minion.prototype.DrawLine = function(from, to, color) {
    this.pathLine.push(new LineRenderable());
    this.pathLine[this.pathLine.length - 1].setColor(color);
    this.pathLine[this.pathLine.length - 1].setFirstVertex(from[0], from[1]);
    this.pathLine[this.pathLine.length - 1].setSecondVertex(to[0], to[1]);
};
