"use strict";

function Tower(texture, pos) {
    this.gridPos = pos;
    this.towerSize = [1, 1];
    this.mHitPoints = 100;
    this.mAccumulator = 0;
    this.mFireRate = 2;
    this.mProjectileSpeed = 3;
    this.mFiringEnabled = false;
    this.mAnimationTime = 0.4;
    this.mAnimationIsShooting = false;
    this.obj = new SpriteRenderable(texture);     
    
    GameObject.call(this, this.obj);
}
gEngine.Core.inheritPrototype(Tower, GameObject);

Tower.prototype.update = function(dt) {
	if (!this.mFiringEnabled) return;

	var haveAlreadyChanged = false;
	this.mAccumulator += dt;

	if (this.mAccumulator > this.mAnimationTime)
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

Tower.prototype.spawnProjectile = function() {}
Tower.prototype.changeAnimationNoShoot = function() {}
Tower.prototype.changeAnimationShoot = function() {}
