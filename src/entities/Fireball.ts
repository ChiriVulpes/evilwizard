import { EntityType } from "core/Entities";
import { Allegiance, DamageType, Entity, EntityState } from "core/Entity";
import { MessageType } from "core/Readout";
import { TileType } from "core/Tiles";
import { TimeManager } from "util/TimeManager";
import { IVector } from "util/Vector";

export class Fireball extends Entity {
	public type = EntityType.Fireball;
	public damageType = [DamageType.Fire];
	public damageAmount = 2;
	public maxHealth = 20;
	public allegiance = Allegiance.EvilWizard;

	public showDamage = false;

	public getBlocker (position: IVector) {
		const blocker = super.getBlocker(position);
		if (blocker instanceof Entity) {
			return;
		}

		return blocker;
	}

	public onBlocked (tileBlocker: Entity | TileType) {
		this.onDestroy();
	}

	public onNoMovementQueued (): undefined {
		this.onDestroy();
		return;
	}

	public onDestroy () {
		this.api.removeEntity(this);
	}

	public update (time: TimeManager) {
		if (time.isNewTick) {
			this.damageAmount += 2;
		}

		if (time.canTick || time.isNewTick) {
			const entity = this.api.getEntityAt(this.getOffsetPosition(), [this], true);
			if (entity && entity.state != EntityState.Dead && entity.type != EntityType.Fireball) {
				const damageResult = this.fight(entity);
				this.damage(DamageType.Fire, Infinity);
				this.api.readout.showDamageResult(damageResult, MessageType.Fight);
			}

		}

		super.update(time);
	}

	public getAnimationFrame (time: TimeManager) {
		return Math.floor(time.tickPercent * 2) % 2;
	}
}
