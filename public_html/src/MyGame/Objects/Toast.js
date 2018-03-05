"use strict";

function Toast(pos) {
	Tower.call(this, "assets/toast.png", pos);
	this.obj.mTexRight = 0.125;
	this.obj._setTexInfo();
	this.mName = "Toast";
	this.mCost = 0;
	this.mHealth = 100;
	this.baseHealth = 100;
}
gEngine.Core.inheritPrototype(Toast, Tower);
