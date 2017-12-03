import { IApi } from "core/Api";
import { Entity } from "core/Entity";
import { MessageType } from "core/Readout";
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

	public canUse () {
		return this.cost <= this.api.player.magic;
	}

	public use () {
		if (!this.canUse()) {
			return false;
		}

		this.api.readout.showMessage(MessageType.Magic,
			`You used your ability ${AbilityType[this.type]} for ${this.cost.toFixed(1)} magic.`,
		);

		this.onUse();

		this.api.player.magic -= this.cost;

		const screenPosition = this.api.canvas.getScreenPosition(this.api.player.position);
		this.api.readout.showNumber(
			MessageType.Magic,
			-this.cost,
			{
				x: screenPosition.x,
				y: screenPosition.y - 30,
			},
		);

		return true;
	}

	public abstract onUse (): any;
}
