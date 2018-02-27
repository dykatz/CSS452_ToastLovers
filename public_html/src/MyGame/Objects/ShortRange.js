"use strict";

function ShortRange(pos) {
	Tower.call(this, "assets/short_range.png", pos);
	this.changeAnimationNoShoot();
	this.mProjectiles = new Set();
	this.mName = "Short Range";
}
gEngine.Core.inheritPrototype(ShortRange, Tower);


ShortRange.prototype.update = function(dt) {
	Tower.prototype.update.call(this, dt);

	this.mProjectiles.forEach(p => { p.update(dt); });
}

ShortRange.prototype.changeAnimationNoShoot = function() {
	this.obj.mTexLeft = 0.0;
	this.obj.mTexRight = 0.5;
	this.obj._setTexInfo();
}

ShortRange.prototype.changeAnimationShoot = function() {
	this.obj.mTexLeft = 0.5;
	this.obj.mTexRight = 1.0;
	this.obj._setTexInfo();
}

ShortRange.prototype.spawnProjectile = function() {
	for (var i = 0; i < 8; ++i) {
		var d = Math.PI * i / 8;
		var x = Math.cos(d) * this.mProjectileSpeed * this.mAccumulator;
		var y = Math.sin(d) * this.mProjectileSpeed * this.mAccumulator;
		var np = new Projectile(this, x, y, d, this.mRange, this.mProjectileSpeed);
	}
}
