"use strict";

function MenuScene() {
	this.mPreviousSegment = MenuScene.currentState.splash;
	this.mSegment = this.mPreviousSegment;
	this.mCam = null;
	this.mTimer = 0;

	this.mLines = [];
	this.mTexts = [];
}
gEngine.Core.inheritPrototype(MenuScene, Scene);

MenuScene.currentState = Object.freeze({
	splash: {x: 0, y: 0},
	levelSelect: {x: 0, y: 100},
	confirmEasy: {x: -100, y: 100},
	confirmMed: {x: 0, y: 200},
	confirmHard: {x: 100, y: 100},
	confirmExit: {x: 0, y: -100},
	help: {x: -100, y: 0},
	credits: {x: 100, y: 0}
});

MenuScene.prototype.initialize = function() {
	this.mCam = new Camera(vec2.fromValues(0, 0), 100, [0, 0, 800, 800]);
	this.mCam.mCameraState.configInterpolation(1, 1);

	for(var i in MenuScene.currentState) {
		var v = MenuScene.currentState[i];
		this.mLines.push(new LineRenderable(v.x - 45, v.y - 45, v.x - 45, v.y + 45));
		this.mLines.push(new LineRenderable(v.x - 45, v.y - 45, v.x + 45, v.y - 45));
		this.mLines.push(new LineRenderable(v.x + 45, v.y - 45, v.x + 45, v.y + 45));
		this.mLines.push(new LineRenderable(v.x - 45, v.y + 45, v.x + 45, v.y + 45));
	}

	var _to_help = new FontRenderable("< Help");
	_to_help.getXform().setPosition(MenuScene.currentState.splash.x - (45 - 15/2 - 1), MenuScene.currentState.splash.y);
	_to_help.getXform().setSize(15, 4);
	this.mTexts.push(_to_help);

	var _to_credits = new FontRenderable("Credits >");
	_to_credits.getXform().setPosition(MenuScene.currentState.splash.x + (45 - 20/2 - 1), MenuScene.currentState.splash.y);
	_to_credits.getXform().setSize(20, 4);
	this.mTexts.push(_to_credits);

	var _to_exit_v = new FontRenderable("V");
	_to_exit_v.getXform().setPosition(MenuScene.currentState.splash.x, MenuScene.currentState.splash.y - (45 - 3/2 - 1));
	_to_exit_v.getXform().setSize(2, 3);
	this.mTexts.push(_to_exit_v);

	var _to_exit = new FontRenderable("Exit");
	_to_exit.getXform().setPosition(MenuScene.currentState.splash.x, MenuScene.currentState.splash.y - (45 - 3 - 4/2 - 1));
	_to_exit.getXform().setSize(10, 4);
	this.mTexts.push(_to_exit);

	var _to_levels_v = new FontRenderable("^");
	_to_levels_v.getXform().setPosition(MenuScene.currentState.splash.x, MenuScene.currentState.splash.y + (47 - 7/2));
	_to_levels_v.getXform().setSize(2.5, 7);
	this.mTexts.push(_to_levels_v);

	var _to_levels = new FontRenderable("Level Select");
	_to_levels.getXform().setPosition(MenuScene.currentState.splash.x, MenuScene.currentState.splash.y + (45 - 3 - 4/2 - 1));
	_to_levels.getXform().setSize(25, 4);
	this.mTexts.push(_to_levels);

	var _to_easy = new FontRenderable("< Easy");
	_to_easy.getXform().setPosition(MenuScene.currentState.levelSelect.x - (45 - 12/2 - 1), MenuScene.currentState.levelSelect.y);
	_to_easy.getXform().setSize(12, 4);
	this.mTexts.push(_to_easy);

	var _to_hard = new FontRenderable("Hard >");
	_to_hard.getXform().setPosition(MenuScene.currentState.levelSelect.x + (45 - 12/2 - 1), MenuScene.currentState.levelSelect.y);
	_to_hard.getXform().setSize(12, 4);
	this.mTexts.push(_to_hard);

	var _back_from_lvl_v = new FontRenderable("V");
	_back_from_lvl_v.getXform().setPosition(MenuScene.currentState.levelSelect.x, MenuScene.currentState.levelSelect.y - (45 - 3/2 - 1));
	_back_from_lvl_v.getXform().setSize(2, 3);
	this.mTexts.push(_back_from_lvl_v);

	var _back_from_lvl = new FontRenderable("Back");
	_back_from_lvl.getXform().setPosition(MenuScene.currentState.levelSelect.x, MenuScene.currentState.levelSelect.y - (45 - 3 - 4/2 - 1));
	_back_from_lvl.getXform().setSize(10, 4);
	this.mTexts.push(_back_from_lvl);

	var _to_med_v = new FontRenderable("^");
	_to_med_v.getXform().setPosition(MenuScene.currentState.levelSelect.x, MenuScene.currentState.levelSelect.y + (47 - 7/2));
	_to_med_v.getXform().setSize(2.5, 7);
	this.mTexts.push(_to_med_v);

	var _to_med = new FontRenderable("Medium");
	_to_med.getXform().setPosition(MenuScene.currentState.levelSelect.x, MenuScene.currentState.levelSelect.y + (45 - 3 - 4/2 - 1));
	_to_med.getXform().setSize(15, 4);
	this.mTexts.push(_to_med);

	var _back_from_med_v = new FontRenderable("V");
	_back_from_med_v.getXform().setPosition(MenuScene.currentState.confirmMed.x, MenuScene.currentState.confirmMed.y - (45 - 3/2 - 1));
	_back_from_med_v.getXform().setSize(2, 3);
	this.mTexts.push(_back_from_med_v);

	var _back_from_med = new FontRenderable("Back");
	_back_from_med.getXform().setPosition(MenuScene.currentState.confirmMed.x, MenuScene.currentState.confirmMed.y - (45 - 3 - 4/2 - 1));
	_back_from_med.getXform().setSize(10, 4);
	this.mTexts.push(_back_from_med);

	var _back_from_exit_v = new FontRenderable("^");
	_back_from_exit_v.getXform().setPosition(MenuScene.currentState.confirmExit.x, MenuScene.currentState.confirmExit.y + (47 - 7/2));
	_back_from_exit_v.getXform().setSize(2.5, 7);
	this.mTexts.push(_back_from_exit_v);

	var _back_from_exit = new FontRenderable("Back");
	_back_from_exit.getXform().setPosition(MenuScene.currentState.confirmExit.x, MenuScene.currentState.confirmExit.y + (45 - 3 - 4/2 - 1));
	_back_from_exit.getXform().setSize(10, 4);
	this.mTexts.push(_back_from_exit);

	var _back_from_hard = new FontRenderable("< Back");
	_back_from_hard.getXform().setPosition(MenuScene.currentState.confirmHard.x - (45 - 12/2 - 1), MenuScene.currentState.confirmHard.y);
	_back_from_hard.getXform().setSize(12, 4);
	this.mTexts.push(_back_from_hard);

	var _back_from_easy = new FontRenderable("Back >");
	_back_from_easy.getXform().setPosition(MenuScene.currentState.confirmEasy.x + (45 - 12/2 - 1), MenuScene.currentState.confirmEasy.y);
	_back_from_easy.getXform().setSize(12, 4);
	this.mTexts.push(_back_from_easy);

	var _back_from_credits = new FontRenderable("< Back");
	_back_from_credits.getXform().setPosition(MenuScene.currentState.credits.x - (45 - 12/2 - 1), MenuScene.currentState.credits.y);
	_back_from_credits.getXform().setSize(12, 4);
	this.mTexts.push(_back_from_credits);

	var _back_from_help = new FontRenderable("Back >");
	_back_from_help.getXform().setPosition(MenuScene.currentState.help.x + (45 - 12/2 - 1), MenuScene.currentState.help.y);
	_back_from_help.getXform().setSize(12, 4);
	this.mTexts.push(_back_from_help);
};

MenuScene.prototype.update = function(dt) {
	this.mCam.mCameraState.updateCameraState();
	
	if(this.mPreviousSegment !== this.mSegment) {
		this.mTimer += 1.5 * dt;

		if(this.mTimer >= 1) {
			this.mPreviousSegment = this.mSegment;
			this.mCam.setWCCenter(this.mSegment.x, this.mSegment.y);
			this.mTimer = 0;
		} else {
			this.mCam.setWCCenter(
				this.mPreviousSegment.x + this.mTimer * (this.mSegment.x - this.mPreviousSegment.x),
				this.mPreviousSegment.y + this.mTimer * (this.mSegment.y - this.mPreviousSegment.y));
		}
	} else {
		if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
			if(this.mSegment === MenuScene.currentState.splash)
				this.mSegment = MenuScene.currentState.help;
			else if(this.mSegment === MenuScene.currentState.credits)
				this.mSegment = MenuScene.currentState.splash;
			else if(this.mSegment === MenuScene.currentState.levelSelect)
				this.mSegment = MenuScene.currentState.confirmEasy;
			else if(this.mSegment === MenuScene.currentState.confirmHard)
				this.mSegment = MenuScene.currentState.levelSelect;
		} else if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
			if(this.mSegment === MenuScene.currentState.help)
				this.mSegment = MenuScene.currentState.splash;
			else if(this.mSegment === MenuScene.currentState.splash)
				this.mSegment = MenuScene.currentState.credits;
			else if(this.mSegment === MenuScene.currentState.confirmEasy)
				this.mSegment = MenuScene.currentState.levelSelect;
			else if(this.mSegment === MenuScene.currentState.levelSelect)
				this.mSegment = MenuScene.currentState.confirmHard;
		} else if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Up)) {
			if(this.mSegment === MenuScene.currentState.confirmExit)
				this.mSegment = MenuScene.currentState.splash;
			else if(this.mSegment === MenuScene.currentState.splash)
				this.mSegment = MenuScene.currentState.levelSelect;
			else if(this.mSegment === MenuScene.currentState.levelSelect)
				this.mSegment = MenuScene.currentState.confirmMed;
		} else if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Down)) {
			if(this.mSegment === MenuScene.currentState.confirmMed)
				this.mSegment = MenuScene.currentState.levelSelect;
			else if(this.mSegment === MenuScene.currentState.levelSelect)
				this.mSegment = MenuScene.currentState.splash;
			else if(this.mSegment === MenuScene.currentState.splash)
				this.mSegment = MenuScene.currentState.confirmExit;
		} else if(gEngine.Input.isKeyClicked(gEngine.Input.keys.Enter)) {
			if(this.mSegment === MenuScene.currentState.confirmExit) {
				console.log("you are here forever");
			} else if(this.mSegment === MenuScene.currentState.confirmEasy
				|| this.mSegment === MenuScene.currentState.confirmMed
				|| this.mSegment === Menu.currentState.confirmHard) {
				gEngine.GameLoop.stop();
			}
		}
	}
};

MenuScene.prototype.draw = function() {
	this.mCam.setupViewProjection();

	for(var i = 0; i < this.mLines.length; ++i)
		this.mLines[i].draw(this.mCam);

	for(var i = 0; i < this.mTexts.length; ++i)
		this.mTexts[i].draw(this.mCam);
};

MenuScene.prototype.loadScene = function() {
	// TODO
};

MenuScene.prototype.unloadScene = function() {
	switch(this.mSegment) {
	case MenuScene.currentState.confirmEasy:
		gEngine.Core.startScene(new GameScene(0));
		break;

	case MenuScene.currentState.confirmMed:
		gEngine.Core.startScene(new GameScene(1));
		break;

	case MenuScene.currentState.confirmHard:
		gEngine.Core.startScene(new GameScene(2));
		break;
	}
};
