"use strict";

function ShortRange(pf, pos) {
	Tower.call(this, pf, "assets/short_range.png", pos);
	this.changeAnimationNoShoot();
	this.mProjectiles = new Set();
	this.mName = "Short Range";
	this.mRange = 15;
	this.mFireRate = 3;
	this.mDamage = 7;
	this.mIndicator.getXform().setSize(this.mRange * 2, this.mRange * 2);
}
gEngine.Core.inheritPrototype(ShortRange, Tower);

ShortRange.maxLevels = 4;
ShortRange.upgradeCosts = [1, 3, 8, 20];

ShortRange.prototype.draw = function(cam) {
	Tower.prototype.draw.call(this, cam);
	this.mProjectiles.forEach(p => { p.draw(cam); });
};

ShortRange.prototype.update = function(dt) {
	Tower.prototype.update.call(this, dt);
	if(!this.mPhysicsEnabled){
	    this.mProjectiles.forEach(p => { p.update(dt); });
	}
};

ShortRange.prototype.changeAnimationNoShoot = function() {
	this.obj.mTexLeft = 0.0;
	this.obj.mTexRight = 0.5;
	this.obj._setTexInfo();
};

ShortRange.prototype.changeAnimationShoot = function() {
	this.obj.mTexLeft = 0.5;
	this.obj.mTexRight = 1.0;
	this.obj._setTexInfo();
};

ShortRange.prototype.spawnProjectile = function() {
	gEngine.AudioClips.playACue("assets/audio/click.ogg");

	for (var i = 0; i < 8; ++i) {
		var d = Math.PI * i / 4;
		var x = this.obj.getXform().getXPos(), y = this.obj.getXform().getYPos();
		var s = this.obj.getXform().getWidth() / 2;
		x += Math.cos(d) * (s + this.mProjectileSpeed * this.mAccumulator);
		y += Math.sin(d) * (s + this.mProjectileSpeed * this.mAccumulator);
		new Projectile(this.pf, x, y, d, this.mRange, this.mProjectileSpeed, this.mDamage);
	}
};

ShortRange.prototype.upgrade = function() {
	if(this.mLevels >= LootFarm.maxLevels)
		return;

	switch(++this.mLevels) {
	case 1:
		this.mDamage = 15;
		this.mRange = 20;
		this.mProjectileSpeed = 40;
		break;

	case 2:
		this.mDamage = 20;
		this.mFireRate = 3.5;
		this.mRange = 22.5;
		this.mProjectileSpeed = 42.5;
		break;

	case 3:
		this.mDamage = 25;
		this.mRange = 30;
		this.mProjectileSpeed = 45;
		break;

	case 4:
		this.mFireRate = 4;
		this.mRange = 35;
		this.mDamage = 28;
		this.mProjectileSpeed = 50;
		break;
	}
};
