import { Ability, AbilityType } from "core/Ability";
import { EntityType } from "core/Entities";
import { DamageType, Entity, EntityState, IDamageResult } from "core/Entity";
import { Fireball as FireballEntity } from "entities/Fireball";
import { IVector } from "util/Vector";

export class Fireball extends Ability {
	public type = AbilityType.Fireball;
	public cost = 4;

	private position?: IVector;
	private tileBlocker?: Entity;

	public canUse () {
		if (!super.canUse()) {
			return false;
		}

		this.position = this.api.player.getOffsetPosition(this.api.player.direction);
		const tileBlocker = this.api.getTileBlocker(this.position);
		if (tileBlocker) {
			if (tileBlocker instanceof Entity) {
				if (tileBlocker.type != EntityType.Fireball && tileBlocker.state != EntityState.Dead) {
					this.tileBlocker = tileBlocker;
				}

			} else {
				return false;
			}
		}

		return true;
	}

	public onUse () {
		if (this.tileBlocker) {
			const damageResult = this.tileBlocker.damage(DamageType.Fire, 2);
			this.api.readout.showDamageResult({
				...damageResult,
				source: EntityType.Fireball,
			} as IDamageResult);

			delete this.tileBlocker;
		}


		const entity = new FireballEntity();
		entity.onStartMove(this.api.player.direction);
		entity.movementQueue = Array(10).fill(this.api.player.direction);
		this.api.addEntity(entity, this.position!);

		delete this.position;
	}
}
