import { Ability, AbilityType } from "core/Ability";
import { DarkHand as DarkHandEntity } from "entities/DarkHand";
import { Vector } from "util/Vector";

export class DarkHand extends Ability {
	public type = AbilityType.DarkHand;
	public cost = 50;

	public onUse () {
		this.api.addEntity(new DarkHandEntity(this.api.player.direction), Vector(this.api.player.position));

		return true;
	}
}
