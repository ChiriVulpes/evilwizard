export enum SoundType {
	WizardStep,
	FlowerStep,
	FrogStep,
	MushroomStep,
	Pickup,
	GameOver,
	LevelUp,
}

export class Sound {
	private sounds: { [key: string]: HTMLAudioElement[] } = {};

	public async load () {
		const soundsLength = Object.keys(SoundType).length / 2;
		const promises: Promise<any>[] = [];
		for (let i = 0; i < soundsLength; i++) {
			this.sounds[i] = [];
			for (let c = 0; c < 5; c++) {
				this.sounds[i].push(new Audio(`./static/sound/${SoundType[i].toLowerCase()}.mp3`));
				promises.push(new Promise(r => this.sounds[i][c].oncanplay = r));
			}
		}

		return Promise.all(promises);
	}

	public play (soundType: SoundType) {
		for (const sound of this.sounds[soundType]) {
			if (sound.paused || sound.ended) {
				sound.play();
				return;
			}
		}
	}
}
