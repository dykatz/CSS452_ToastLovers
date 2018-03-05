"use strict";

function Tower(texture, pos, playField) {
    this.mGridPos = pos;
    this.mWeight = 100;    
    this.mSize = [1, 1];
    this.mHitPoints = 100;
    this.mAccumulator = 0;
    this.mFireRate = 2;
    this.mProjectileSpeed = 15;
    this.mFiringEnabled = false;
    this.mAnimationTime = 0.3;
    this.mAnimationIsShooting = false;
    this.mDamage = 0;
    this.mRange = 20;
    this.mCost = 1;
    this.mName = "";
    this.obj = new SpriteAnimateRenderable(texture);  
    this.mProjectiles = null;
    this.mPlayField = playField;
    
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
};

Tower.prototype.CheckProjectileCollisions = function(collidingObject) {
    if(this.mProjectiles !== null){
        this.mProjectiles.forEach(p => { p.TryCollide(collidingObject);});
    }
};

Tower.prototype.enableFiring = function() {
	this.mFiringEnabled = true;
};

Tower.prototype.disableFiring = function() {
	this.mFiringEnabled = false;
	this.mAccumulator = 0;
	this.changeAnimationNoShoot();
};



Tower.prototype.spawnProjectile = function() {};
Tower.prototype.changeAnimationNoShoot = function() {};
Tower.prototype.changeAnimationShoot = function() {};
