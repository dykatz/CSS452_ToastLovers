"use strict";

function Toast(pos) {
    Tower.call(this, "assets/toast.png", pos);
    this.obj.mTexRight = 0.125;
    this.obj._setTexInfo();
    this.mCost = 0;
}
gEngine.Core.inheritPrototype(Toast, Tower);
