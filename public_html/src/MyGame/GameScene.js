/* global gEngine, Scene, vec2 */
"use strict";

function GameScene() {
    this.iToast = "assets/toast.png";
    this.iWall = "assets/wall.png";
    this.iLongRange = "assets/long_range.png";
    this.iShortRange = "assets/short_range.png";
    this.iProjectile = "assets/projectile.png";
    this.iHoneypot = "assets/honeypot.png";
    this.iMinion = "assets/target.png";
    
    this.playfield = null;
    this.mCam = null;
    this.shop = null;
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
    
    this.shop = new Shop();
    this.playfield = new Playfield([31, 21], this.mCam, this.shop);
    this.minimap = new Minimap(this.mCam);
    this.shop.pf = this.playfield;

    var c = gEngine.DefaultResources.getGlobalAmbientColor();
    c[0] = 1.0;
    c[1] = 1.0;
    c[2] = 1.0;
    c[3] = 1.0;
};

GameScene.prototype.update = function (dt) {     
    this.playfield.update(dt);
    this.shop.update(dt);
};

GameScene.prototype.draw = function () { 
    this.mCam.setupViewProjection();
    this.playfield.draw(this.mCam);
    this.shop.draw();
    this.minimap.cam.setupViewProjection();
    this.playfield.draw(this.minimap.cam, false);
};

GameScene.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.iToast);
    gEngine.Textures.loadTexture(this.iWall);
    gEngine.Textures.loadTexture(this.iLongRange);
    gEngine.Textures.loadTexture(this.iShortRange);
    gEngine.Textures.loadTexture(this.iProjectile);
    gEngine.Textures.loadTexture(this.iHoneypot);
    gEngine.Textures.loadTexture(this.iMinion);
};

GameScene.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.iToast);
    gEngine.Textures.unloadTexture(this.iWall);
    gEngine.Textures.unloadTexture(this.iLongRange);
    gEngine.Textures.unloadTexture(this.iShortRange);
    gEngine.Textures.unloadTexture(this.iProjectile);
    gEngine.Textures.unloadTexture(this.iHoneypot);
    gEngine.Textures.unloadTexture(this.iMinion);
};
