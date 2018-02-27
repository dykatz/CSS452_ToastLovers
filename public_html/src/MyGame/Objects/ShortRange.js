"use strict";

function ShortRange(pos) {
	Tower.call(this, "assets/short_range.png", pos);
	this.hitPoints = 100;
	this.fireRate = 0.1;
	this.obj.mTexRight = 0.5;
	this.obj._setTexInfo();
}
gEngine.Core.inheritPrototype(ShortRange, Tower);
