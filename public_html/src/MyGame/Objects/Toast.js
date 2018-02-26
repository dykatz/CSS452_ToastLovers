"use strict";

function Toast(texture, pos) {
    Tower.call(this, texture, pos);
    this.hitPoints = 100;
}
gEngine.Core.inheritPrototype(Toast, Tower);
