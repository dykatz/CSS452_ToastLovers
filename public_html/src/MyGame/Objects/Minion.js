"use strict";


// TODO:: MinionFactory that spawns at some gPos and destroy function. Also, behavior once at target position
function Minion(pf, gSpawnPos) {
    this.img = new SpriteRenderable("assets/target.png");
    GameObject.call(this, this.img);

    this.pf = pf;
    this.graph = pf.graph;

    this.mHealth = 100;
    this.mSpeed = 10;
    this.movementEnabled = true;

    this.path = [];
    this.pathIndex = 0;
    this.pathLine = [];
    this.drawPath = true;
    this.curGridPos = gSpawnPos;

    this.getXform().setPosition(gSpawnPos[0] * this.pf.nodeW + this.pf.nodeW / 2, 
                                gSpawnPos[1] * -this.pf.nodeH - this.pf.nodeH / 2);
    this.getXform().setSize(this.pf.nodeW, this.pf.nodeH);

    this.updatePath(this.pf.toastCords);
}
gEngine.Core.inheritPrototype(Minion, GameObject);

Minion.prototype.update = function(dt) {
    if(!this.movementEnabled) return;

    var pos = this.getXform().getPosition();
    this.curGridPos = this.pf.WCToGridIndex(pos[0], pos[1]);
    var targetGridPos = [this.path[this.pathIndex].x, this.path[this.pathIndex].y];
    var targetPos = this.pf.GridIndexToWC(targetGridPos[0], targetGridPos[1]);
    
    var dir = this.getCurrentFrontDir();
    pos[0] += this.mSpeed * dt * dir[0];
    pos[1] += this.mSpeed * dt * dir[1];
    
    if(dir[0] !== 0 && Math.round(pos[1]) !== Math.round(targetPos[1]) || 
            dir[1] !== 0 && Math.round(pos[0]) !== Math.round(targetPos[0])) {
        var adjustedDir = [targetPos[0] - pos[0], targetPos[1] - pos[1]];
        this.setCurrentFrontDir(adjustedDir);
    }
        
    if(dir[0] !== 0 && Math.round(pos[0]) === Math.round(targetPos[0]) || 
            dir[1] !== 0 && Math.round(pos[1]) === Math.round(targetPos[1])) {
    	if(this.pathIndex < this.path.length - 1) {
            this.pathIndex++;
            this.getNewDir();
    	} else { 
            console.log("Reached Target location. Do something now.");
            this.movementEnabled = false;
    	}
    }
};

Minion.prototype.draw = function(cam) {
    GameObject.prototype.draw.call(this, cam);
    if(this.drawPath)
        for(var i = 0; i < this.pathLine.length; i++)
            this.pathLine[i].draw(cam);
};

Minion.prototype.updatePath = function(gPos) { 
    this.path = astar.search(this.graph,
        this.graph.grid[this.curGridPos[0]][this.curGridPos[1]],
        this.graph.grid[gPos[0]][gPos[1]], null);
    this.pathIndex = 0;
    this.getNewDir();
    
    if(this.drawPath)
        this.DrawPath();
};

Minion.prototype.getNewDir = function() {
    var targetGridPos = [this.path[this.pathIndex].x, this.path[this.pathIndex].y];
    this.setCurrentFrontDir([targetGridPos[0] - this.curGridPos[0], -(targetGridPos[1] - this.curGridPos[1])]);        
};

Minion.prototype.DrawPath = function() {
    if(this.path !== null) {
        this.pathLine = [];

        if(this.path.length > 0) {
            this.pathLine.push(new LineRenderable());
            this.pathLine[0].setColor([1,0,0,1]);
            var IndexWCPosition = this.pf.GridIndexToWC(this.curGridPos[0], this.curGridPos[1]);
            this.pathLine[0].setFirstVertex(IndexWCPosition[0], IndexWCPosition[1]);
            IndexWCPosition = this.pf.GridIndexToWC(this.path[0].x, this.path[0].y);
            this.pathLine[0].setSecondVertex(IndexWCPosition[0], IndexWCPosition[1]);

            for(var i = 0; i < this.path.length - 1; i++) {
                this.pathLine.push(new LineRenderable());
                this.pathLine[i + 1].setColor([1,0,0,1]);
                IndexWCPosition = this.pf.GridIndexToWC(this.path[i].x, this.path[i].y);
                this.pathLine[i + 1].setFirstVertex(IndexWCPosition[0], IndexWCPosition[1]);
                IndexWCPosition = this.pf.GridIndexToWC(this.path[i + 1].x, this.path[i + 1].y);
                this.pathLine[i + 1].setSecondVertex(IndexWCPosition[0], IndexWCPosition[1]);
            }
        }
    }
};
