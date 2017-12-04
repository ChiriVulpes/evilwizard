import { Ability, AbilityType } from "core/Ability";
import { EntityState } from "core/Entity";
import { MessageType } from "core/Readout";
import { SoundType } from "core/Sound";

export class Eraser extends Ability {
	public type = AbilityType.Eraser;
	public cost = 200;

	public used = false;

	public canUse () {
		return !this.used;
	}

	public onUse () {
		this.used = true;
		for (const entity of this.api.entities) {
			entity.state = EntityState.Dead;
		}

		this.api.player.state = EntityState.Alive;

		this.api.readout.showMessage(MessageType.Bad, "All plants and creatures fall to the ground limp.");
		this.api.readout.showMessage(MessageType.Bad, "Nothing is left.");
		this.api.readout.disableMessages();
		this.api.sounds.play(SoundType.GameOver);

		document.body.style.setProperty("--creepiness", `${1}`);


		return true;
	}
}
