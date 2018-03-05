"use strict";

function Projectile(parent, x, y, direction, range, speed, damage) {
	this.mRenderComponent = new SpriteAnimateRenderable("assets/projectile.png");
	this.mRenderComponent.getXform().setRotationInRad(direction);
	this.mRenderComponent.getXform().setPosition(x, y);
	this.mRenderComponent.getXform().setSize(5, 5);

	this.mSpeed = speed;
	this.mRange = range;
	this.mParent = parent;
	this.mAccumulator = 0;
	this.mDamage = damage;
	this.mEnabled = true;
	this.mRenderComponent.mElmWidth = 0.25;
	this.mRenderComponent.mNumElems = 4;
	this.mRenderComponent._initAnimation();
        this.collided = false;
        //this.bounds = new BoundingBox([x, y], 5, 5);

	this.mParent.mProjectiles.add(this);
}gEngine.Core.inheritPrototype(Projectile, GameObject);

Projectile.prototype.update = function(dt) {
        if(!this.collided){
            var direction = this.mRenderComponent.getXform().getRotationInRad();
            this.mRenderComponent.getXform().incXPosBy(Math.cos(direction) * dt * this.mSpeed);
            this.mRenderComponent.getXform().incYPosBy(Math.sin(direction) * dt * this.mSpeed);
            this.mAccumulator += dt * this.mSpeed;

            if (this.mEnabled && this.mAccumulator > this.mRange)
                    this.mEnabled = false;

            this.mRenderComponent.updateAnimation(dt);
        }

	if (!this.mEnabled) {
		var c = this.mRenderComponent.mColor;
		c[3] += 2 * dt;
		this.mRenderComponent.getXform().incWidthBy(-10 * dt);
		this.mRenderComponent.getXform().incHeightBy(-10 * dt);

		if (c[3] >= 1)
			this.destroy();
	}
};

Projectile.prototype.TryCollide = function(minionColliding) {
    var pos = [0, 0];
    if(!this.collided && this.pixelTouches(minionColliding, pos)){
        this.collided = true;
        this.mEnabled = false;
        minionColliding.TakeDamage(this.mDamage);
    }
};

Projectile.prototype.draw = function(cam) {
	this.mRenderComponent.draw(cam);
};

Projectile.prototype.destroy = function() {
	this.mParent.mProjectiles.delete(this);
};
