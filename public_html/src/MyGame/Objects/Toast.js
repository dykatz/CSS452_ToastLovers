"use strict";

function Toast(texture, pos) {
    Tower.call(this, texture, pos);
    this.hitPoints = 100;
    this.obj.mTexRight = 0.125;
    this.obj._setTexInfo();
}
gEngine.Core.inheritPrototype(Toast, Tower);
