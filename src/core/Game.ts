import { Controls } from "core/Controls";
import { DungeonGenerator } from "core/DungeonGenerator";
import { EntityType } from "core/Entities";
import { Direction, Entity } from "core/Entity";
import { Tile } from "core/Tiles";
import { World } from "core/World";
import { EvilWizard } from "entities/EvilWizard";
import { Mushroom } from "entities/Mushroom";
import { Canvas } from "util/Canvas";
import * as Random from "util/Random";
import { TimeManager } from "util/TimeManager";
import { IVector, Vector } from "util/Vector";

export class Game {
	private isRunning = false;
	private _paused: boolean;
	public get paused () {
		return this._paused;
	}
	public set paused (paused: boolean) {
		this._paused = paused;
	}

	private entities: Entity[] = [];
	private canvas = new Canvas("game");
	private time = new TimeManager();
	private world: World;
	private dungeonGenerator = new DungeonGenerator();
	private controls = new Controls();
	private player: EvilWizard;

	public async load () {
		await this.canvas.loadImages(Tile, "tile", [Tile.None]);
		await this.canvas.loadImages(EntityType, "entity");
	}

	public start () {
		this.time.reset();
		this.isRunning = true;
		this.world = new World();
		this.newLevel();
		this.controls.start();

		this.addEntity(this.player = new EvilWizard(), Vector(
			Math.floor(this.world.size.x / 2),
			Math.floor(this.world.size.y / 2),
		));

		this.loop();
	}

	public stop () {
		this.isRunning = false;
		this.controls.stop();
	}

	private addEntity (entity: Entity, position: IVector) {
		entity.position = position;
		entity.getEntities = () => this.entities;
		this.entities.push(entity);
	}

	private loop () {
		if (!this.isRunning) {
			return;
		}

		this.time.update();

		this.update();
		this.render();

		requestAnimationFrame(() => this.loop());
	}

	private update () {
		if (this.time.canTick) {
			if (this.controls.isDown("KeyW")) {
				this.player.move(Direction.Up);
				this.time.nextTick();

			} else if (this.controls.isDown("KeyA")) {
				this.player.move(Direction.Left);
				this.time.nextTick();

			} else if (this.controls.isDown("KeyS")) {
				this.player.move(Direction.Down);
				this.time.nextTick();

			} else if (this.controls.isDown("KeyD")) {
				this.player.move(Direction.Right);
				this.time.nextTick();

			} else if (this.controls.isDown("Space")) {
				this.time.nextTick();
			}
		}

		for (const object of this.entities) {
			object.update(this.time);
		}
	}

	private render () {
		this.canvas.viewportPosition = this.player.getOffsetPosition(undefined, this.time.tickPercent);
		this.canvas.clear();
		this.world.render(this.canvas);

		for (const object of this.entities) {
			object.render(this.time, this.canvas);
		}
	}

	private newLevel () {
		this.dungeonGenerator.generate(this.world);
		this.spawnEnemies();
	}

	private spawnEnemies () {
		for (const room of this.dungeonGenerator.rooms) {
			const enemyCount = Random.int(1, 4);
			for (let i = 0; i < enemyCount; i++) {
				let position: IVector;
				do {
					position = Vector(room.position.x + Random.int(room.size.x), room.position.y + Random.int(room.size.y));
				} while (this.entityAt(position));

				this.addEntity(new Mushroom(), position);
			}
		}
	}

	private entityAt (position: IVector) {
		for (const object of this.entities) {
			if (object instanceof Entity && object.position.x == position.x && object.position.y == position.y) {
				return object;
			}
		}

		return undefined;
	}
}
