"use strict";

function Node(center, w, h)
{
    this.w = w;
    this.h = h;
    
    this.br = [center[0] - w / 2, center[1] - h / 2];
    
    this.top = new LineRenderable();
    this.bottom = new LineRenderable();
    this.left = new LineRenderable();
    this.right = new LineRenderable();
    
    this.top.setVertices(this.minX(), this.maxY(), this.maxX(), this.maxY());
    this.bottom.setVertices(this.minX(), this.minY(), this.maxX(), this.minY());
    this.left.setVertices(this.minX(), this.minY(), this.minX(), this.maxY());
    this.right.setVertices(this.maxX(), this.minY(), this.maxX(), this.maxY());
};

Node.prototype.draw = function(cam) {
    this.top.draw(cam);
    this.bottom.draw(cam);
    this.left.draw(cam);
    this.right.draw(cam);
};

Node.prototype.minX = function () { return this.br[0]; };
Node.prototype.maxX = function () { return this.br[0] + this.w; };
Node.prototype.minY = function () { return this.br[1]; };
Node.prototype.maxY = function () { return this.br[1] + this.h; };
