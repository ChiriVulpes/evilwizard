import { Ability, AbilityType } from "core/Ability";

export class DarkHand extends Ability {
	public type = AbilityType.DarkHand;
	public cost = 20;

	public onUse () {
		return true;
	}
}
