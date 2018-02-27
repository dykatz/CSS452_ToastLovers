"use strict";

function LongRange(pos) {
	Tower.call(this, "assets/long_range.png", pos);
        
	this.obj.mTexRight = 0.25;
	this.obj._setTexInfo();

	this.mProjectiles = new Set();

	this.changeAnimationNoShoot();
}
gEngine.Core.inheritPrototype(LongRange, Tower);

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
	this.obj.mTexLeft = 0.5;
	this.obj.mTexRight = 0.75;
	this.obj._setTexInfo();
}

LongRange.prototype.changeAnimationNoShoot = function() {
	this.obj.mTexLeft = 0.25;
	this.obj.mTexRight = 0.5;
	this.obj._setTexInfo();
}
