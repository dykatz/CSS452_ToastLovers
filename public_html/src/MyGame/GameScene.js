/* global gEngine, Scene, vec2 */

function GameScene() {
    this.fakeToast = "assets/target.png";
    
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

GameScene.prototype.update = function () {            
};

GameScene.prototype.draw = function () { 
    this.mCam.setupViewProjection();
    this.playfield.draw(this.mCam);
};

GameScene.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.fakeToast);
};

GameScene.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.fakeToast);
};