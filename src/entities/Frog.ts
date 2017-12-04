import { EntityType } from "core/Entities";
import { DamageType, Entity, EntityState } from "core/Entity";
import { SoundType } from "core/Sound";
import { TileType } from "core/Tiles";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";

export class Frog extends Entity {
	public type = EntityType.Frog;
	public magic = 10;
	public maxHealth = 2;
	public resistances = [DamageType.Earth, DamageType.Water, DamageType.Physical];
	public weaknesses = [DamageType.Fire, DamageType.Physical];
	public damageType = [DamageType.Earth, DamageType.Water];
	public damageAmount = 2.5;
	public hasBeenAttacked = false;
	public stepSound = SoundType.FrogStep;

	public onDamage (amt: number) {
		this.hasBeenAttacked = true;
		return super.onDamage(amt);
	}

	public onBlocked (tileBlocker: Entity | TileType, force = false) {
		if (force) {
			super.onBlocked(tileBlocker);

		} else {
			this.wander(true);
		}
	}

	public update (time: TimeManager) {
		if (this.state != EntityState.Dead) {
			let player: Entity | undefined;
			if (this.hasBeenAttacked) {
				player = this.getNearest(EntityType.EvilWizard, 5);
			}

			if (this.hasBeenAttacked && player) {
				this.moveTowards(player);

			} else {
				if (Random.chance(0.5)) {
					this.resetMovementQueue();

				} else {
					this.wander();
				}
			}
		}

		super.update(time);
	}
}
