"use strict";

function Tower(texture, pos) {
    this.gridPos = pos;
    this.towerSize = [1, 1];
    this.obj = new SpriteRenderable(texture);     
    
    GameObject.call(this, this.obj);
}
gEngine.Core.inheritPrototype(Tower, GameObject);
