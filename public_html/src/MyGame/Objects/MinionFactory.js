"use strict";

function MinionFactory(pf, mode, paths) {
	this.pf = pf;
	this.graph = pf.graph;
	this.minions = pf.minions;

	this.spawnMode = mode;
	this.spawnPointCount = paths;
	this.spawnWait = 1;
	this.spawnPoints = [];
	

	this.waveComposition = [
		[1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 3, 3, 3, 3, 3],
		[1, 1, 1, 3, 3, 3, 2, 2, 2],
		[2, 3, 2, 3, 2, 3, 2, 3, 2, 3]
	];

	this.wave = 0;
	this.start = false;

	this.timer = 0;
};

MinionFactory.SpawnMode = Object.freeze({
	entireBorder: 0,
	specificPoints: 1
});

MinionFactory.prototype.update = function(dt) {
	if(gEngine.Input.isKeyClicked(gEngine.Input.keys.N))
		this.startWave();

	if(!this.start)
		return;

	this.timer += dt;

	if (this.timer >= this.spawnWait && this.waveComposition.length > 0 && this.waveComposition.length > this.wave) {
		if (this.waveComposition[this.wave] !== null && this.waveComposition[this.wave].length > 0) {
			this.spawn(this.waveComposition[this.wave][0])
			this.waveComposition[this.wave].shift();
			this.timer = 0;
		}
	}

	if(this.waveComposition.length > 0 && this.waveComposition.length > this.wave) {
		if(this.waveComposition[this.wave] !== null && this.waveComposition[this.wave].length === 0) {
			this.wave++;
			this.start = false;
		}
	} else {
		this.pf.allWavesSpawned = true;
		console.log("All Waves completed");
	}
};

MinionFactory.prototype.startWave = function() {
	this.start = true;
	this.spawnPoints = [];

	if(this.spawnMode == MinionFactory.SpawnMode.entireBorder) {
		var holeNumbers = [];

		for(var i = 0; i < this.spawnPointCount; ++i) {
			var n = Math.floor(Math.random() * ((this.pf.gWidth + this.pf.gHeight - 2) * 2 - i));

			for(var j = 0; j < i; ++j) {
				if(n >= holeNumbers[j])
					++n;
			}

			holeNumbers.push(n);
		}

		for(var i = 0; i < holeNumbers.length; ++i) {
			var n = holeNumbers[i];

			if(n < this.pf.gWidth) {
				this.spawnPoints.push([n, 0]);
				continue;
			}

			n -= this.pf.gWidth;

			if(n < this.pf.gWidth) {
				this.spawnPoints.push([n, this.pf.gHeight - 1]);
				continue;
			}

			n -= this.pf.gWidth;

			if(n < this.pf.gHeight - 2) {
				this.spawnPoints.push([0, n + 1]);
				continue;
			}

			n -= this.pf.gHeight - 2;
			this.spawnPoints.push([this.pf.gWidth - 1, n + 1]);
		}
	} else if (this.spawnMode == MinionFactory.SpawnMode.specificPoints) {
		// TODO - implement this
	}
}

MinionFactory.prototype.spawn = function(type) {
	var newMinion = new Minion(this.pf, this.spawnPoints[Math.floor(Math.random() * this.spawnPointCount)]);
	console.log("type: " + type);

	switch(type) {
	case 2:
		newMinion.mSpeed = 20;
		newMinion.mHealth = 75;
		break;

	case 3:
		newMinion.mSpeed = 5;
		newMinion.mHealth = 150;
		break;
	}

	this.minions.addToSet(newMinion);
};
