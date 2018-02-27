"use strict";

function Projectile(parent, x, y, direction, range, speed, damage) {
	this.obj = new SpriteAnimateRenderable("assets/projectile.png");
	this.obj.getXform().setRotationInRad(direction);
	this.obj.getXform().setPosition(x, y);
	this.obj.getXform().setSize(5, 5);

	this.mSpeed = speed;
	this.mRange = range;
	this.mParent = parent;
	this.mAccumulator = 0;
	this.mDamage = damage;
	this.mEnabled = true;
	this.obj.mElmWidth = 0.25;
	this.obj.mNumElems = 4;
	this.obj._initAnimation();

	this.mParent.mProjectiles.add(this);
}

Projectile.prototype.update = function(dt) {
	var direction = this.obj.getXform().getRotationInRad();
	this.obj.getXform().incXPosBy(Math.cos(direction) * dt * this.mSpeed);
	this.obj.getXform().incYPosBy(Math.sin(direction) * dt * this.mSpeed);
	this.mAccumulator += dt * this.mSpeed;

	if (this.mEnabled && this.mAccumulator > this.mRange)
		this.mEnabled = false;

	this.obj.updateAnimation(dt);

	if (!this.mEnabled) {
		var c = this.obj.mColor;
		c[3] += 2 * dt;
		this.obj.getXform().incWidthBy(-10 * dt);
		this.obj.getXform().incHeightBy(-10 * dt);

		if (c[3] >= 1)
			this.destroy();
	}
}

Projectile.prototype.draw = function(cam) {
	this.obj.draw(cam);
}

Projectile.prototype.destroy = function() {
	this.mParent.mProjectiles.delete(this);
}
