"use strict";

function Projectile(parent, x, y, direction, range, speed) {
	this.obj = new SpriteAnimateRenderable("assets/projectile.png");
	this.obj.getXform().setRotationInRad(direction);
	this.obj.getXform().setPosition(x, y);
	this.obj.getXform().setSize(5, 5);

	this.mSpeed = speed;
	this.mRange = range;
	this.mParent = parent;
	this.mAccumulator = 0;
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

	if (this.mAccumulator > this.mRange)
		this.mParent.mProjectiles.delete(this);

	this.obj.updateAnimation(dt);
}

Projectile.prototype.draw = function(cam) {
	this.obj.draw(cam);
}
