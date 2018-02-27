/* global gEngine, Scene, vec2 */
"use strict";

function GameScene() {
    this.iToast = "assets/toast.png";
    this.iWall = "assets/wall.png";
    this.iLongRange = "assets/long_range.png";
    this.iShortRange = "assets/short_range.png";
    
    this.playfield = null;
    this.mCam = null;
    this.uiCam = null;
    this.minimap = null;
}
gEngine.Core.inheritPrototype(GameScene, Scene);

GameScene.prototype.initialize = function () {
    this.mCam = new Camera(
        vec2.fromValues(100, -75), // Top left = (0, 0), World = 200x150
        200,
        [0, 200, 800, 600]
    );
    this.mCam.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    
    this.uiCam = new Camera(
        vec2.fromValues(500, 500),
        200,
        [0, 0, 800, 200]
    );
    this.uiCam.setBackgroundColor([0.3, 0.4, 0.8, 1]);
    
    this.playfield = new Playfield(31, 21, this.mCam);
    this.minimap = new Minimap(this.mCam);
};

GameScene.prototype.update = function (dt) {     
    this.playfield.update(dt);
};

GameScene.prototype.draw = function () { 
    this.mCam.setupViewProjection();
    this.playfield.draw(this.mCam);
    this.uiCam.setupViewProjection();
    this.minimap.cam.setupViewProjection();
    this.playfield.draw(this.minimap.cam, false);
};

GameScene.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.iToast);
    gEngine.Textures.loadTexture(this.iWall);
    gEngine.Textures.loadTexture(this.iLongRange);
    gEngine.Textures.loadTexture(this.iShortRange);
};

GameScene.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.iToast);
    gEngine.Textures.unloadTexture(this.iWall);
    gEngine.Textures.unloadTexture(this.iLongRange);
    gEngine.Textures.unloadTexture(this.iShortRange);
};
