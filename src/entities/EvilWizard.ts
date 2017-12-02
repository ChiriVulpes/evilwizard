import { EntityType } from "core/Entities";
import { DamageType, Entity } from "core/Entity";

export class EvilWizard extends Entity {
	public type = EntityType.EvilWizard;
	public magic = 0;
	public maxHealth = 10;
	public resistances = [DamageType.Dark, DamageType.Earth, DamageType.Water];
	public weaknesses = [DamageType.Fire, DamageType.Light];
}
