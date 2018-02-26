/* global gEngine, Scene, vec2 */
"use strict";

function GameScene() {
    this.fakeToast = "assets/toast.png";
    this.fakeTower = "assets/wall.png";
    
    this.playfield = null;
    this.mCam = null;
}
gEngine.Core.inheritPrototype(GameScene, Scene);

GameScene.prototype.initialize = function () {
    this.mCam = new Camera(
        vec2.fromValues(100, -75), // Top left = (0, 0), World = 200x150
        200,
        [0, 200, 800, 600]
    );
    this.mCam.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    
    this.playfield = new Playfield(31, 21, this.mCam);
};

GameScene.prototype.update = function (dt) {     
    this.playfield.update(dt);
};

GameScene.prototype.draw = function () { 
    this.mCam.setupViewProjection();
    this.playfield.draw(this.mCam);
};

GameScene.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.fakeToast);
    gEngine.Textures.loadTexture(this.fakeTower);
};

GameScene.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.fakeToast);
    gEngine.Textures.unloadTexture(this.fakeTower);
};
