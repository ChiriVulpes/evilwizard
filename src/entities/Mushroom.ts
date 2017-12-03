import { EntityType } from "core/Entities";
import { DamageType, Entity, EntityState } from "core/Entity";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";

export class Mushroom extends Entity {
	public type = EntityType.Mushroom;
	public magic = 5;
	public maxHealth = 2;
	public resistances = [DamageType.Earth, DamageType.Dark];
	public weaknesses = [DamageType.Fire, DamageType.Light, DamageType.Physical];
	public damageType = [DamageType.Earth, DamageType.Dark];
	public damageAmount = 2;

	public update (time: TimeManager) {
		if (this.state != EntityState.Dead) {
			if (Random.chance(0.2)) {
				this.resetMovementQueue();

			} else if (Random.chance(0.3)) {
				this.wander();

			} else {
				const player = this.getNearest(EntityType.EvilWizard, 5);
				if (player) {
					this.moveTowards(player);
				}
			}
		}

		super.update(time);
	}
}
