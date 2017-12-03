import { Ability, AbilityType } from "core/Ability";

export class Fireball extends Ability {
	public type = AbilityType.Fireball;
	public cost = 20;

	public onUse () {
		return true;
	}
}
