import { Direction, IApi } from "core/Api";
import { EntityType } from "core/Entities";
import { Allegiance, DamageType, Entity, EntityState } from "core/Entity";
import { Tile } from "core/Tiles";
import { EvilWizard } from "entities/EvilWizard";
import { Canvas } from "util/Canvas";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";
import { IVector, Vector } from "util/Vector";

interface IBranch {
	position: IVector;
	direction: Direction;
	length: number;
}

function addDirection (position: IVector, direction: Direction, amount = 1, existing = false) {
	if (!existing) {
		position = Vector(position);
	}

	if (direction == Direction.Up) {
		position.y -= amount;

	} else if (direction == Direction.Down) {
		position.y += amount;

	} else if (direction == Direction.Left) {
		position.x -= amount;

	} else if (direction == Direction.Right) {
		position.x += amount;
	}

	return position;
}

function oppositeDirection (direction: Direction) {
	switch (direction) {
		case Direction.Down: return Direction.Up;
		case Direction.Up: return Direction.Down;
		case Direction.Left: return Direction.Right;
		case Direction.Right: return Direction.Left;
	}
}

function rotateDirection (direction: Direction, clockwise = true) {
	switch (direction) {
		case Direction.Down: return clockwise ? Direction.Left : Direction.Right;
		case Direction.Left: return clockwise ? Direction.Up : Direction.Down;
		case Direction.Up: return clockwise ? Direction.Right : Direction.Left;
		case Direction.Right: return clockwise ? Direction.Down : Direction.Up;
	}
}

export class DarkHand extends Entity {
	public type = EntityType.DarkHand;
	public damageType = [DamageType.Dark];
	public damageAmount = 50;
	public maxHealth = Infinity;
	public allegiance = Allegiance.EvilWizard;
	public showDamage = false;
	public api: IApi<Entity, EvilWizard>;

	private branches: IBranch[];
	private blockedTiles: number[] = [];
	private initialDirection: Direction;

	constructor(direction: Direction) {
		super();
		this.initialDirection = direction;
	}

	public update (time: TimeManager) {
		if (this.branches === undefined) {
			this.branches = [
				{
					position: this.position,
					direction: this.initialDirection,
					length: 2,
				},
				{
					position: this.position,
					direction: oppositeDirection(this.initialDirection),
					length: 2,
				},
			];

			this.updateBlockedTiles();
		}

		if (time.isNewTick) {
			this.grow();
			this.updateBlockedTiles();

			for (const branch of this.branches) {
				for (let i = 0; i < branch.length; i++) {
					const position = addDirection(branch.position, branch.direction, i);

					for (const entity of this.api.entities) {
						if (
							entity.position.x == position.x && entity.position.y == position.y &&
							entity.allegiance != this.allegiance
						) {
							if (entity.state != EntityState.Dead && entity.allegiance != this.allegiance) {
								this.fight(entity);
							}

							if (entity.state == EntityState.Dead) {
								this.api.player.stealMagic(entity, this.type);
							}
						}
					}
				}
			}
		}
	}

	public render (time: TimeManager, canvas: Canvas) {
		const imageName = canvas.getImageName(EntityType[this.type], "entity");

		for (const branch of this.branches) {
			for (let i = 0; i < branch.length; i++) {
				const position = addDirection(branch.position, branch.direction, i);

				canvas.drawFrame(imageName,
					branch.direction,
					i == branch.length - 1 ? 1 : 0,
					position,
				);
			}
		}

	}

	public blocksTile (tile: IVector) {
		return this.blockedTiles.includes(this.api.world.getTileLocation(tile));
	}

	private updateBlockedTiles () {
		this.blockedTiles = [];
		for (const branch of this.branches) {
			for (let i = 0; i < branch.length; i++) {
				const position = addDirection(branch.position, branch.direction, i);

				this.blockedTiles.push(this.api.world.getTileLocation(position));
			}
		}
	}

	private grow () {
		for (const branch of this.branches) {
			if (Random.chance(3 / branch.length / this.branches.length / this.branches.length)) {
				const branchPosition = addDirection(branch.position, branch.direction, branch.length);
				if (Tile.isWalkable(this.api.world.getTile(branchPosition))) {
					branch.length++;
				}

			} else {
				if (branch.length > 3 && Random.chance(0.2 * branch.length / this.branches.length / this.branches.length)) {
					const newBranchPosition = addDirection(branch.position, branch.direction, Random.int(2, branch.length));
					const branchSideADirection = rotateDirection(branch.direction);
					const branchSideBDirection = rotateDirection(branch.direction, false);
					if (
						!Tile.isWalkable(this.api.world.getTile(
							addDirection(newBranchPosition, branchSideADirection),
						)) ||
						!Tile.isWalkable(this.api.world.getTile(
							addDirection(newBranchPosition, branchSideBDirection),
						))
					) {
						continue;
					}

					this.branches.push(
						{
							position: newBranchPosition,
							direction: branchSideADirection,
							length: 2,
						},
						{
							position: newBranchPosition,
							direction: branchSideBDirection,
							length: 2,
						},
					);
				}
			}
		}
	}
}
