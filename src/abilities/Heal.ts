import { Ability, AbilityType } from "core/Ability";
import { NumberType } from "core/Readout";
import { Random } from "util/Random";

export class Heal extends Ability {
	public type = AbilityType.Heal;
	public cost = 5;

	public onUse () {
		if (this.api.player.health >= this.api.player.maxHealth) {
			return false;
		}

		const amt = Random(1, Math.floor(this.api.player.maxHealth / 4));
		this.api.player.health += amt;
		if (this.api.player.health > this.api.player.maxHealth) {
			this.api.player.health = this.api.player.maxHealth;
		}

		this.api.readout.showNumber(NumberType.Heal, amt, this.api.canvas.getScreenPosition(this.api.player.position));

		return true;
	}
}
