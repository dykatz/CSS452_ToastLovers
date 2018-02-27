"use strict";

function LongRange(pos) {
	Tower.call(this, "assets/long_range.png", pos);
	this.hitPoints = 100;
	this.accuracy = 0.1;
	this.fireRate = 0.1;
	this.obj.mTexRight = 0.334;
	this.obj._setTexInfo();
}
gEngine.Core.inheritPrototype(LongRange, Tower);
