"use strict";

function LongRange(pos) {
	Tower.call(this, "assets/long_range.png", pos);
        
	this.obj.mTexRight = 0.25;
	this.obj._setTexInfo();

	this.bg = new SpriteRenderable("assets/long_range.png");
	this.bg.mTexRight = 0.25;
	this.bg._setTexInfo();
	this.bg.getXform().mPosition = this.obj.getXform().mPosition;
	this.bg.getXform().mScale = this.obj.getXform().mScale;
	this.bg.mColor = this.obj.mColor;

	this.mProjectiles = new Set();
	this.mName = "Long Range";

	this.changeAnimationNoShoot();
}
gEngine.Core.inheritPrototype(LongRange, Tower);

LongRange.prototype.draw = function(cam) {
	this.bg.draw(cam);
	Tower.prototype.draw.call(this, cam);
}

LongRange.prototype.update = function(dt) {
	Tower.prototype.update.call(this, dt);

	this.obj.getXform().incRotationByRad(dt);
	this.mProjectiles.forEach(p => { p.update(dt); });
}

LongRange.prototype.spawnProjectile = function() {
	var d = this.obj.getXform().getRotationInRad();
	var x = Math.cos(d) * this.mProjectileSpeed * this.mAccumulator;
	var y = Math.sin(d) * this.mProjectileSpeed * this.mAccumulator;
	var np = new Projectile(this, x, y, d, this.mRange, this.mProjectileSpeed);
}

LongRange.prototype.changeAnimationShoot = function() {
	this.obj.mTexLeft = 0.5;
	this.obj.mTexRight = 0.75;
	this.obj._setTexInfo();
}

LongRange.prototype.changeAnimationNoShoot = function() {
	this.obj.mTexLeft = 0.25;
	this.obj.mTexRight = 0.5;
	this.obj._setTexInfo();
}
