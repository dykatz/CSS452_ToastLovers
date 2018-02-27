"use strict";

function Toast(pos) {
    Tower.call(this, "assets/toast.png", pos);
    this.obj.mTexRight = 0.125;
    this.obj._setTexInfo();
}
gEngine.Core.inheritPrototype(Toast, Tower);
