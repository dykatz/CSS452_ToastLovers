"use strict";

function LootFarm(pf, pos) {
	Honeypot.call(this, pf, pos);
	this.mName = "Loot Farm";
	this.mCost = 3;
	this.mAllowance = 5;

	this.fg = new LightRenderable("assets/lootfarm.png");
	this.fg.mNumElems = 4;
	this.fg.mElmWidth = 0.25;
	this.fg._initAnimation();
	this.fg.getXform().mPosition = this.obj.getXform().mPosition;
	this.fg.getXform().mScale = this.obj.getXform().mScale;

	for(var i = 0; i < pf.mLights.length; ++i)
		this.fg.addLight(pf.mLights[i]);
}
gEngine.Core.inheritPrototype(LootFarm, Honeypot);

LootFarm.prototype.update = function(dt) {
	if(!this.mPhysicsEnabled)
	    this.fg.updateAnimation(dt);

	Honeypot.prototype.update.call(this, dt);
};

LootFarm.prototype.draw = function(cam) {
	Honeypot.prototype.draw.call(this, cam);
	this.fg.draw(cam);
};

LootFarm.prototype.onWaveComplete = function(wave) {
	this.pf.shop.setPlayerCurrency(this.pf.shop.playerCurrency + this.mAllowance);
};
