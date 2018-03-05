
function MinionFactory(pf, gPos) {
	this.pf = pf;
	this.graph = pf.graph;
	this.minions = pf.minions;

	this.spawnPoint = gPos;
	this.spawnWait = 1;
	// Eventually parse from JSON where 1 = default, 2 = fast, 3 = slow
	this.waveComposition = [[1, 2, 1, 2, 1],
							[3, 2, 3, 2, 3]];

	this.wave = 0;
	this.start = true;

	this.timer = 0;
};

MinionFactory.prototype.update = function(dt) {

	if(gEngine.Input.isKeyClicked(gEngine.Input.keys.N))
		this.start = true;

	if(!this.start) return;

	this.timer += dt;

	if(this.timer >= this.spawnWait && this.waveComposition.length > 0) {
		if(this.waveComposition[this.wave].length > 0) {
			this.spawn(this.waveComposition[this.wave][0])
			this.waveComposition[this.wave].shift();
			this.timer = 0;
		}
	}

	if(this.waveComposition.length > 0) {
		if(this.waveComposition[this.wave].length === 0) {
			this.wave++;
			this.start = false;
		}
	} else {
		console.log("All Waves completed");
	}
};

MinionFactory.prototype.spawn = function(type) {
	var newMinion = new Minion(this.pf, this.spawnPoint);
	console.log("type: " + type);

	if(type === 2)
		newMinion.mSpeed = 20;
	if(type === 3)
		newMinion.mSpeed = 5;

	this.minions.addToSet(newMinion);
};