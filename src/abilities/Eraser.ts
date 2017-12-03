import { Ability, AbilityType } from "core/Ability";

export class Eraser extends Ability {
	public type = AbilityType.Eraser;
	public cost = 50;

	public onUse () {
		return true;
	}
}
