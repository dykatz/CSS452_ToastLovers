/* global gEngine, Scene, vec2 */
"use strict";

function GameScene(difficulty) {
	this.iToast = "assets/toast.png";
	this.iWall = "assets/boulder.png";
	this.iLongRange = "assets/long_range.png";
	this.iShortRange = "assets/short_range.png";
	this.iProjectile = "assets/projectile.png";
	this.iHoneypot = "assets/honeypot.png";
	this.iMinion = "assets/ant.png";
	this.iRangeIndicator = "assets/indicator.png";
	this.iCursors = "assets/tools.png";
	this.iTile = "assets/WoodTile.png";

	this.playfield = null;
	this.mCam = null;
	this.shop = null;
	this.minimap = null;
	this.winner = false;
	this.difficulty = difficulty;
}
gEngine.Core.inheritPrototype(GameScene, Scene);

GameScene.prototype.initialize = function() {
	this.mCam = new Camera(
		vec2.fromValues(100, -75), // Top left = (0, 0), World = 200x150
		200,
		[0, 200, 800, 600]
	);
	this.mCam.setBackgroundColor([0.8, 0.8, 0.8, 1]);

	this.shop = new Shop();
	this.playfield = new Playfield([31, 21], this.mCam, this.shop, this.difficulty);
	this.minimap = new Minimap(this.mCam);
	this.shop.pf = this.playfield;
	this.shop.initializeShop(this.shop.getTowers(), 1);

	var c = gEngine.DefaultResources.getGlobalAmbientColor();
	c[0] = 0.2;
	c[1] = 0.2;
	c[2] = 0.2;
	c[3] = 0.2;
};

GameScene.prototype.update = function(dt) {
	this.playfield.update(dt);
	this.shop.update(dt);

	if(this.playfield.finishedLevel) {
		if(this.playfield.playerLost || this.playfield.playerWon)
			this.winner = this.playfield.playerWon;

		gEngine.GameLoop.stop();
	}
};

GameScene.prototype.draw = function() {
	this.mCam.setupViewProjection();
	this.playfield.draw(this.mCam);
	this.shop.draw();
	this.minimap.cam.setupViewProjection();
	this.playfield.draw(this.minimap.cam, false);
};

GameScene.prototype.loadScene = function() {
	gEngine.Textures.loadTexture(this.iToast);
	gEngine.Textures.loadTexture(this.iWall);
	gEngine.Textures.loadTexture(this.iLongRange);
	gEngine.Textures.loadTexture(this.iShortRange);
	gEngine.Textures.loadTexture(this.iProjectile);
	gEngine.Textures.loadTexture(this.iHoneypot);
	gEngine.Textures.loadTexture(this.iMinion);
	gEngine.Textures.loadTexture(this.iRangeIndicator);
	gEngine.Textures.loadTexture(this.iCursors);
	gEngine.Textures.loadTexture(this.iTile);
};

GameScene.prototype.unloadScene = function() {
	gEngine.Textures.unloadTexture(this.iToast);
	gEngine.Textures.unloadTexture(this.iWall);
	gEngine.Textures.unloadTexture(this.iLongRange);
	gEngine.Textures.unloadTexture(this.iShortRange);
	gEngine.Textures.unloadTexture(this.iProjectile);
	gEngine.Textures.unloadTexture(this.iHoneypot);
	gEngine.Textures.unloadTexture(this.iMinion);
	gEngine.Textures.unloadTexture(this.iRangeIndicator);
	gEngine.Textures.unloadTexture(this.iCursors);
	gEngine.Textures.unloadTexture(this.iTile);

	var nextScene;
	if (!this.winner)
		nextScene = new LossScreen();
	else
		nextScene = new WinScreen();

	gEngine.Core.startScene(nextScene);
};
