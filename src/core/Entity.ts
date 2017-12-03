import { Direction, IApi } from "core/Api";
import { EntityType } from "core/Entities";
import { MessageType } from "core/Readout";
import { TileType } from "core/Tiles";
import { Canvas } from "util/Canvas";
import { GameObject } from "util/GameObject";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";
import { IVector, Vector } from "util/Vector";

export interface IDamageResult {
	source: EntityType;
	target: EntityType;
	amt: number;
	effectiveness: number;
	crit: CritType;
}

export enum CritType {
	None,
	Fail,
	Success,
}

export enum DamageType {
	Physical,
	Fire,
	Light,
	Dark,
	Earth,
	Water,
}

export enum Allegiance {
	EvilWizard,
	Nature,
}

export enum EntityState {
	Alive,
	Dead,
}

export enum EntityBaseAnimation {
	Down,
	Up,
	Right,
	Left,
}

export abstract class Entity<Animation extends number = EntityBaseAnimation> extends GameObject {
	public type: EntityType;
	public magic: number;
	public maxHealth: number;
	public resistances: DamageType[] = [];
	public weaknesses: DamageType[] = [];
	public allegiance = Allegiance.Nature;
	public damageType: DamageType[];
	public damageAmount: number;
	public showDamage = true;

	public health: number;
	public position: IVector;
	public animation: Animation = EntityBaseAnimation.Down as Animation;
	public movementQueue: Array<Direction | undefined> = [];
	public movement?: Direction;
	public attack?: Direction;
	public direction = Direction.Down;
	public state = EntityState.Alive;

	public api: IApi<Entity>;

	public resetMovementQueue () {
		this.movementQueue = [];
	}

	public resetMovement () {
		this.movement = undefined;
		this.movementQueue = [];
	}

	public getBlocker (position: IVector): Entity | TileType | undefined {
		return this.api.getTileBlocker(position, [this]);
	}

	public move (direction: Direction) {
		this.movementQueue = [direction];
	}

	public moveTowards (entity: Entity) {
		const distX = entity.position.x - this.position.x;
		const distY = entity.position.y - this.position.y;

		let direction: Direction;
		if (Math.abs(distX) > Math.abs(distY)) {
			direction = distX < 0 ? Direction.Left : Direction.Right;

		} else {
			direction = distY < 0 ? Direction.Up : Direction.Down;
		}

		this.move(direction);
	}

	public wander () {
		this.move(Random.int(4));
	}

	public fight (entity: Entity): IDamageResult {
		return {
			...entity.damage(this.damageType, this.damageAmount),
			source: this.type,
		} as IDamageResult;
	}

	public damage (damageTypes: DamageType | DamageType[], amt: number): Partial<IDamageResult> {
		if (!Array.isArray(damageTypes)) {
			damageTypes = [damageTypes];
		}

		let effectiveness = 0;
		for (const damageType of damageTypes) {
			if (this.weaknesses.includes(damageType)) {
				effectiveness += 0.1;

			} else if (this.resistances.includes(damageType)) {
				effectiveness -= 0.1;
			}
		}

		let potency = 0.5 + effectiveness;

		let crit = CritType.None;

		// crit success
		if (Random.chance(0.1)) {
			potency += 0.2;
			crit = CritType.Success;
		}

		// crit fail
		if (Random.chance(0.1)) {
			potency -= 0.2;
			crit = CritType.Fail;
		}

		amt *= potency;
		this.health -= amt;
		if (this.showDamage) {
			this.api.readout.showNumber(MessageType.Damage, -amt, this.api.canvas.getScreenPosition(this.position));
		}

		if (this.health <= 0) {
			this.onDestroy();
		}

		return {
			target: this.type,
			amt,
			effectiveness,
			crit,
		};
	}

	public getNearest (type: EntityType, within = Infinity) {
		let entityDistance = Infinity;
		let nearest: Entity | undefined;
		for (const entity of this.api.entities) {
			if (entity.type != type) {
				continue;
			}

			const dist = Math.avg(
				Math.abs(entity.position.x - this.position.x),
				Math.abs(entity.position.y - this.position.y),
			);
			if (dist < entityDistance && dist <= within) {
				nearest = entity;
				entityDistance = dist;
			}
		}

		return nearest;
	}

	public update (time: TimeManager) {
		if (time.canTick || time.isNewTick) {
			if (this.movement !== undefined) {
				this.position = this.getOffsetPosition();
				this.movement = undefined;

			} else if (this.attack !== undefined) {
				this.attack = undefined;
			}
		}

		if (time.isNewTick) {
			if (this.movementQueue.length > 0) {
				this.movement = this.movementQueue.shift();

			} else {
				this.movement = this.onNoMovementQueued();
			}

			if (this.movement !== undefined) {
				this.direction = this.movement;
				const tileBlocker = this.getBlocker(this.getOffsetPosition());
				if (tileBlocker !== undefined) {
					this.onBlocked(tileBlocker);
				}
			}

			if (this.movement !== undefined) {
				this.onStartMove(this.movement);
			}

			if (this.attack !== undefined) {
				this.onStartAttack(this.attack);
			}
		}
	}

	public render (time: TimeManager, canvas: Canvas) {
		const imageName = canvas.getImageName(EntityType[this.type], "entity");

		canvas.drawFrame(imageName,
			this.animation,
			this.getAnimationFrame(time),
			this.getAnimationPosition(time.tickPercent),
		);
	}

	public getAnimationPosition (percent = 1) {
		if (this.movement === undefined) {
			return this.getOffsetPosition(this.attack, (0.5 - Math.abs(percent - 0.5)) * 0.5);
		}

		return this.getOffsetPosition(undefined, percent);
	}

	public getOffsetPosition (movement = this.movement, percent = 1) {
		const result = Vector(this.position);

		if (movement == Direction.Up) {
			result.y -= percent;

		} else if (movement == Direction.Down) {
			result.y += percent;

		} else if (movement == Direction.Left) {
			result.x -= percent;

		} else if (movement == Direction.Right) {
			result.x += percent;
		}

		return result;
	}

	public getAnimationFrame (time: TimeManager) {
		return this.state === EntityState.Dead ? 3 :
			this.movement !== undefined ? 1 + Math.floor(time.tickPercent * 2) % 2 : 0;
	}

	public onStartMove (direction: Direction) {
		this.animation = direction as any;
	}

	public onStartAttack (direction: Direction) {
		this.animation = direction as any;
	}

	public onDestroy () {
		this.state = EntityState.Dead;
	}

	public onBlocked (tileBlocker: Entity | TileType) {
		if (tileBlocker instanceof Entity && this.allegiance != tileBlocker.allegiance) {
			this.attack = this.movement;
			const damageResult = this.fight(tileBlocker);
			this.onShowFightResult(damageResult);
		}

		this.resetMovement();
	}

	public onShowFightResult (damageResult: IDamageResult) {
		this.api.readout.showDamageResult(damageResult);
	}

	public onNoMovementQueued (): Direction | undefined {
		return;
	}
}
