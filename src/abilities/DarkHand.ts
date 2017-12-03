import { Ability, AbilityType } from "core/Ability";

export class DarkHand extends Ability {
	public type = AbilityType.DarkHand;
	public cost = 10;

	public onUse () {
		return true;
	}
}
