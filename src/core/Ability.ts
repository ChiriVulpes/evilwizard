import { IApi } from "core/Api";
import { Entity } from "core/Entity";
import { EvilWizard } from "entities/EvilWizard";

export enum AbilityType {
	Heal,
	DarkHand,
	Fireball,
	Eraser,
}

export abstract class Ability {
	public type: AbilityType;
	public cost: number;
	public api: IApi<Entity, EvilWizard>;

	public use () {
		if (this.cost > this.api.player.magic) {
			return false;
		}

		if (!this.onUse()) {
			return false;
		}

		this.api.player.magic -= this.cost;

		return true;
	}

	public abstract onUse (): boolean;
}
