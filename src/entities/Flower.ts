import { EntityType } from "core/Entities";
import { DamageType, Entity, EntityState } from "core/Entity";
import { SoundType } from "core/Sound";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";

export class Flower extends Entity {
	public type = EntityType.Flower;
	public magic = 2;
	public maxHealth = 5;
	public resistances = [DamageType.Earth, DamageType.Light, DamageType.Water];
	public weaknesses = [DamageType.Fire, DamageType.Dark, DamageType.Physical];
	public damageType = [DamageType.Physical];
	public damageAmount = 1.5;
	public stepSound = SoundType.FlowerStep;

	public update (time: TimeManager) {
		if (this.state != EntityState.Dead) {
			if (Random.chance(0.9)) {
				this.resetMovementQueue();

			} else {
				this.wander();
			}
		}

		super.update(time);
	}
}
