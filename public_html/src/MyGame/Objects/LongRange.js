"use strict";

function LongRange(pos) {
	Tower.call(this, "assets/long_range.png", pos);

	this.bkg = new SpriteRenderable("assets/long_range.png");
	this.bkg.mTexRight = 0.333;
	this.bkg._setTexInfo();

	this.mProjectiles = new Set();

	this.changeAnimationNoShoot();
}
gEngine.Core.inheritPrototype(LongRange, Tower);

LongRange.prototype.draw = function(cam) {
	if (this.isVisible() && this.mDrawRenderable)
		this.bkg.draw(cam);

	Tower.prototype.draw.call(this);
}

LongRange.prototype.update = function(dt) {
	Tower.prototype.update.call(this, dt);

	this.mProjectiles.forEach(p => { p.update(dt); });
}

LongRange.prototype.spawnProjectile = function() {
	var d = this.obj.getXform().getRotationInRad();
	var x = Math.cos(d) * this.mProjectileSpeed * this.mAccumulator;
	var y = Math.sin(d) * this.mProjectileSpeed * this.mAccumulator;
	var np = new Projectile(this, x, y, d, this.mRange, this.mProjectileSpeed);
}

LongRange.prototype.changeAnimationShoot = function() {
	this.obj.mTexLeft = 0.6667;
	this.obj.mTexRight = 1.0;
	this.obj._setTexInfo();
}

LongRange.prototype.changeAnimationNoShoot = function() {
	this.obj.mTexLeft = 0.333;
	this.obj.mTexRight = 0.667;
	this.obj._setTexInfo();
}
