import { EntityType } from "core/Entities";
import { Allegiance, DamageType, Entity, EntityState, IDamageResult } from "core/Entity";
import { MessageType } from "core/Readout";
import { SoundType } from "core/Sound";
import { TileType } from "core/Tiles";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";
import { IVector } from "util/Vector";

export class EvilWizard extends Entity {
	public type = EntityType.EvilWizard;
	public magic = 0;
	public maxHealth = 15;
	public resistances = [DamageType.Dark, DamageType.Earth, DamageType.Water];
	public weaknesses = [DamageType.Fire, DamageType.Light];
	public allegiance = Allegiance.EvilWizard;
	public damageType = [DamageType.Physical, DamageType.Dark];
	public damageAmount = 2;
	public stepSound = SoundType.WizardStep;

	public getBlocker (position: IVector): Entity | TileType | undefined {
		const blocker = super.getBlocker(position);
		if (blocker instanceof Entity && blocker.type == EntityType.DarkHand) {
			return;
		}

		return blocker;
	}

	public onDamage (amt: number) {
		const level = this.api.playerLevel + 1;
		amt *= level * level * level;
		super.onDamage(amt);

		return amt;
	}

	public update (time: TimeManager) {
		if (this.state != EntityState.Dead) {
			const corpse = this.api.getCorpseAt(this.position);
			if (corpse && corpse.magic) {
				this.stealMagic(corpse);
				this.api.sounds.play(SoundType.Pickup);
			}
		}

		super.update(time);
	}

	public stealMagic (corpse: Entity, source = this.type) {
		const stolenMagic = Random(corpse.magic / 2, corpse.magic * 1.5) + this.api.playerLevel * this.api.playerLevel;
		this.magic += stolenMagic;
		this.api.removeEntity(corpse);
		this.api.readout.showNumber(MessageType.Magic, stolenMagic, this.api.canvas.getScreenPosition(this.position));
		this.api.readout.showMessage(MessageType.Magic, `
			${this.api.readout.getName(source, true)} collected ${stolenMagic.toFixed(1)}
			magic from ${this.api.readout.getName(corpse.type)}.
		`);
	}

	public onShowFightResult (damageResult: IDamageResult) {
		this.api.readout.showDamageResult(damageResult, MessageType.Fight);
	}

	public onDestroy () {
		super.onDestroy();
		setTimeout(() => {
			this.api.readout.showMessage(MessageType.Bad,
				"You were killed! The forest will consume your remains...",
			);
			this.api.sounds.play(SoundType.GameOver);

			setTimeout(() => {
				this.api.reset();
			}, 5000);
		}, 100);
	}
}
