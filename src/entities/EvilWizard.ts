import { EntityType } from "core/Entities";
import { Allegiance, DamageType, Entity, EntityState } from "core/Entity";
import { NumberType } from "core/Readout";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";

export class EvilWizard extends Entity {
	public type = EntityType.EvilWizard;
	public magic = 0;
	public maxHealth = 10;
	public resistances = [DamageType.Dark, DamageType.Earth, DamageType.Water];
	public weaknesses = [DamageType.Fire, DamageType.Light];
	public allegiance = Allegiance.EvilWizard;
	public damageType = [DamageType.Physical, DamageType.Dark];
	public damageAmount = 2;

	public update (time: TimeManager) {
		if (this.state != EntityState.Dead) {
			const corpse = this.api.getCorpseAt(this.position);
			if (corpse && corpse.magic) {
				const stolenMagic = Random(corpse.magic / 2, corpse.magic * 1.5);
				this.magic += stolenMagic;
				this.api.removeEntity(corpse);
				this.api.readout.showNumber(NumberType.Magic, stolenMagic, this.api.canvas.getScreenPosition(this.position));
			}
		}

		super.update(time);
	}
}
