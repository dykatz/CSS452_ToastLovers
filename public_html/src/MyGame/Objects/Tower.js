"use strict";

function Tower(texture, pos) {
    this.gridPos = pos;
    this.towerSize = [1, 1];
    this.mHitPoints = 100;
    this.mAccumulator = 0;
    this.mFireRate = 2;
    this.mProjectileSpeed = 3;
    this.mFiringEnabled = false;
    this.mAnimationTime = 0.8;
    this.mAnimationIsShooting = false;
    this.mRange = 20;
    this.obj = new SpriteRenderable(texture);     
    
    GameObject.call(this, this.obj);
}
gEngine.Core.inheritPrototype(Tower, GameObject);

Tower.prototype.update = function(dt) {
	if (!this.mFiringEnabled) return;

	var haveAlreadyChanged = false;
	this.mAccumulator += dt;

	if (this.mAccumulator > this.mAnimationTime / this.mFireRate)
		this.changeAnimationNoShoot();

	while (this.mAccumulator > 1 / this.mFireRate) {
		this.mAccumulator -= 1 / this.mFireRate;
		this.spawnProjectile();

		if (!haveAlreadyChanged) {
			haveAlreadyChanged = true;
			this.changeAnimationShoot();
		}
	}

}

Tower.prototype.enableFiring = function() {
	this.mFiringEnabled = true;
}

Tower.prototype.disableFiring = function() {
	this.mFiringEnabled = false;
	this.mAccumulator = 0;
	this.changeAnimationNoShoot();
}

Tower.prototype.spawnProjectile = function() {}
Tower.prototype.changeAnimationNoShoot = function() {}
Tower.prototype.changeAnimationShoot = function() {}
