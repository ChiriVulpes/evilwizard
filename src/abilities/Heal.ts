import { Ability, AbilityType } from "core/Ability";
import { MessageType } from "core/Readout";
import { Random } from "util/Random";

export class Heal extends Ability {
	public type = AbilityType.Heal;
	public cost = 8;

	public canUse () {
		return super.canUse() && this.api.player.health < this.api.player.maxHealth;
	}

	public onUse () {
		const amt = Random(this.api.player.maxHealth / 5, Math.floor(this.api.player.maxHealth / 4));
		this.api.player.health += amt;
		if (this.api.player.health > this.api.player.maxHealth) {
			this.api.player.health = this.api.player.maxHealth;
		}

		this.api.readout.showNumber(MessageType.Heal, amt, this.api.canvas.getScreenPosition(this.api.player.position));
		this.api.readout.showMessage(MessageType.Heal,
			`You regained ${amt.toFixed(1)} health.`,
		);

		return true;
	}
}
