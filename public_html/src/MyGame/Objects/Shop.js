"use strict";

function Shop(playfield) {
    this.cam = new Camera(
        vec2.fromValues(50, 37.5),
        100,
        [266, 0, 534, 200]
    );
    this.cam.setBackgroundColor([0.3, 0.4, 0.8, 1]);
    
    this.pf = playfield;
    this.shopState = Shop.shopState.towerShop;
    this.playerCurrency = 10;
    
    this.towerButtons = [];
    this.towerButtonTitles = [];
    this.towerButtonCosts = [];
    this.initializeShop(this.getTowers(), 1);
};

Shop.shopState = Object.freeze({
    towerShop: 1,
    upgradeShop: 2
});

Shop.prototype.initializeShop = function(towers, padding) {
    var shopWidth = this.cam.getWCWidth() - padding * (towers.length - 1);
    var shopHeight = this.cam.getWCHeight();
    var bSz = (shopWidth / towers.length) < shopHeight 
                ? (shopWidth / towers.length) : shopHeight / 1.5;
    
    for(var i = 0; i < towers.length; ++i) {
        var tower = towers[i].getRenderable();
        var x = bSz * (i + 0.5) + padding * (i + 1);

        var newButton = new Button([x, 37.5], bSz, bSz, tower, i + 49);
        var newTitle = new FontRenderable(towers[i].mName);
        var newCost = new FontRenderable(towers[i].mCost.toString());

        newTitle.getXform().setPosition(x, 37.5 + 5 / 2 + 1 + bSz / 2);
        newTitle.getXform().setSize(bSz, 5);
        newCost.getXform().setPosition(x, 37.5 - 5 / 2 - bSz / 2);
        newCost.getXform().setSize(5, 5);

        this.towerButtons.push(newButton);
        this.towerButtonTitles.push(newTitle);
        this.towerButtonCosts.push(newCost);
    }
};

Shop.prototype.getTowers = function() {
    return [new LongRange(), new ShortRange()];
};

Shop.prototype.purchaseTower = function(index) {
    var newTower = this.getTowers()[index];
    if(this.playerCurrency - newTower.mCost >= 0 && this.pf.selectedTower === null) {
        this.playerCurrency -= newTower.mCost;
        newTower.getXform().setPosition(-10, 0);
        newTower.getXform().setSize(this.pf.nodeW, this.pf.nodeH);
        newTower.getRenderable().setColor([1, 0, 0, 0.4]);
        this.pf.selectedTower = newTower;
        this.pf.pfState = Playfield.PlayfieldState.placementState;
        console.log("Player currency: " + this.playerCurrency);
    }
};

Shop.prototype.update = function(dt) {
    var x = null, y = null;
    if(this.cam.isMouseInViewport()) {
        x = this.cam.mouseWCX();
        y = this.cam.mouseWCY();

        if(this.pf.selectedTower)
            this.pf.selectedTower.getXform().setPosition(x, y);
    }

    switch(this.shopState) {
        case Shop.shopState.towerShop:
            for(var i = 0; i < this.towerButtons.length; ++i)
                if(this.towerButtons[i].checkButton(x, y))
                    this.purchaseTower(i);

            break;

        case Shop.shopState.upgradeShop:
            break;
    }
};

Shop.prototype.draw = function() {    
    this.cam.setupViewProjection();    
    
    switch(this.shopState) {
        case Shop.shopState.towerShop:            
            for(var i = 0; i < this.towerButtons.length; ++i)
                this.towerButtons[i].draw(this.cam);

            for(var i = 0; i < this.towerButtonTitles.length; ++i)
                this.towerButtonTitles[i].draw(this.cam);

            for(var i = 0; i < this.towerButtonCosts.length; ++i)
                this.towerButtonCosts[i].draw(this.cam);

            if(this.pf.selectedTower !== null)
                this.pf.selectedTower.draw(this.cam);

            break;

        case Shop.shopState.upgradeShop:
            break;
    }
};