import { Direction, IApi } from "core/Api";
import { EntityType } from "core/Entities";
import { Tile } from "core/Tiles";
import { Canvas } from "util/Canvas";
import { GameObject } from "util/GameObject";
import * as Random from "util/Random";
import { TimeManager } from "util/TimeManager";
import { IVector, Vector } from "util/Vector";

export enum DamageType {
	Physical,
	Fire,
	Light,
	Dark,
	Earth,
	Water,
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

	public health: number;
	public position: IVector;
	public animation: Animation = EntityBaseAnimation.Down as Animation;
	public movementQueue: Direction[] = [];
	public movement?: Direction;
	public canMoveChecked = false;

	public api: IApi<Entity>;

	public resetMovementQueue () {
		this.movementQueue = [];
	}

	public resetMovement () {
		this.movement = undefined;
		this.movementQueue = [];
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

	public canActuallyMove () {
		const offsetPosition = this.getOffsetPosition();
		const tile = this.api.world.getTile(offsetPosition);
		if (!Tile.isWalkable(tile)) {
			return false;
		}

		for (const entity of this.api.entities) {
			if (entity === this) {
				continue;
			}

			const entityOffsetPosition = entity.getOffsetPosition(
				entity.movement === undefined ? entity.movementQueue[0] : entity.movement,
			);
			if (
				(entityOffsetPosition.x == offsetPosition.x && entityOffsetPosition.y == offsetPosition.y) ||
				(entity.position.x == offsetPosition.x && entity.position.y == offsetPosition.y)
			) {
				return false;
			}
		}

		return true;
	}

	public fight (entity: Entity) {

	}

	public damage (damageTypes: DamageType | DamageType[], amt: number) {
		if (!Array.isArray(damageTypes)) {
			damageTypes = [damageTypes];
		}

		let potency = 0.5;

		for (const damageType of damageTypes) {
			if (this.weaknesses.includes(damageType)) {
				potency += 0.1;

			} else if (this.resistances.includes(damageType)) {
				potency -= 0.1;
			}
		}

		this.health -= amt * potency;
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
		if (this.movement !== undefined) {
			if (time.canTick || time.isNewTick) {
				this.position = this.getOffsetPosition();
				this.movement = undefined;
			}
		}

		if (time.isNewTick) {
			this.movement = this.movementQueue.shift();

			if (this.movement !== undefined) {
				if (!this.canActuallyMove()) {
					this.resetMovement();
				}
			}

			if (this.movement !== undefined) {
				this.onStartMove(this.movement);
			}
		}
	}

	public render (time: TimeManager, canvas: Canvas) {
		const imageName = canvas.getImageName(EntityType[this.type], "entity");

		canvas.drawFrame(imageName,
			this.animation,
			this.movement !== undefined ? 1 + Math.floor(time.tickPercent * 2) % 2 : 0,
			this.getOffsetPosition(undefined, time.tickPercent),
		);
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

	public onStartMove (direction: Direction) {
		this.animation = direction as any;
	}
}
