import { DarkHand } from "abilities/DarkHand";
import { Eraser } from "abilities/Eraser";
import { Fireball } from "abilities/Fireball";
import { Heal } from "abilities/Heal";
import { Ability } from "core/Ability";
import { Direction, IApi, MagicLevel, magicLevels } from "core/Api";
import { Controls } from "core/Controls";
import { DungeonGenerator } from "core/DungeonGenerator";
import { EntityType } from "core/Entities";
import { Entity, EntityState } from "core/Entity";
import { Readout } from "core/Readout";
import { TileType } from "core/Tiles";
import { World } from "core/World";
import { EvilWizard } from "entities/EvilWizard";
import { Canvas } from "util/Canvas";
import { TimeManager } from "util/TimeManager";
import { IVector, Vector } from "util/Vector";

export class Game implements IApi {
	public entities: Entity[] = [];
	public world: World;
	public canvas = new Canvas("game");
	public readout = new Readout();
	public player: EvilWizard;

	private isRunning = false;
	private _paused: boolean;
	public get paused () {
		return this._paused;
	}
	public set paused (paused: boolean) {
		this._paused = paused;
	}

	private time = new TimeManager();
	private dungeonGenerator = new DungeonGenerator();
	private controls = new Controls();
	private playerLevel: MagicLevel;
	private abilities: Ability[];

	public async load () {
		await this.canvas.loadImages(TileType, "tile", [TileType.None]);
		await this.canvas.loadImages(EntityType, "entity");
	}

	public start () {
		this.time.reset();
		this.isRunning = true;
		this.world = new World();
		this.newLevel();
		this.playerLevel = MagicLevel.None;
		this.abilities = [];
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

	public getCorpseAt (position: IVector): Entity | undefined {
		for (const entity of this.entities) {
			if (
				entity.state == EntityState.Dead &&
				entity.position.x == position.x && entity.position.y == position.y
			) {
				return entity;
			}
		}
	}

	public removeEntity (corpse: Entity) {
		const index = this.entities.indexOf(corpse);
		this.entities.splice(index, 1);
	}

	private addEntity (entity: Entity, position: IVector) {
		entity.api = this;
		entity.position = position;
		entity.health = entity.maxHealth;
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

	// tslint:disable-next-line cyclomatic-complexity
	private update () {
		if (this.time.canTick && this.player.state != EntityState.Dead) {
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

			} else if (this.controls.isDown("Digit1") || this.controls.isDown("Numpad1")) {
				if (this.abilities[0] && this.abilities[0].use()) {
					this.time.nextTick();
				}

			} else if (this.controls.isDown("Digit2") || this.controls.isDown("Numpad2")) {
				if (this.abilities[1] && this.abilities[1].use()) {
					this.time.nextTick();
				}

			} else if (this.controls.isDown("Digit3") || this.controls.isDown("Numpad3")) {
				if (this.abilities[2] && this.abilities[2].use()) {
					this.time.nextTick();
				}

			} else if (this.controls.isDown("Digit4") || this.controls.isDown("Numpad4")) {
				if (this.abilities[3] && this.abilities[3].use()) {
					this.time.nextTick();
				}

			}
		}

		for (const object of this.entities.slice().sort((a, b) =>
			(a.state == EntityState.Dead ? -Infinity : a.position.y) - (b.state == EntityState.Dead ? -Infinity : b.position.y),
		)) {
			object.update(this.time);
		}

		this.readout.setMagic(this.player.magic);
		this.readout.setHealth(this.player.health, this.player.maxHealth);
		if (this.player.magic >= magicLevels[this.playerLevel + 1]) {
			this.playerLevel++;
			switch (this.playerLevel) {
				case MagicLevel.Level1:
					this.abilities[0] = new Heal();
					this.abilities[0].api = this;
					break;
				case MagicLevel.Level2:
					this.abilities[1] = new DarkHand();
					this.abilities[1].api = this;
					break;
				case MagicLevel.Level3:
					this.abilities[2] = new Fireball();
					this.abilities[2].api = this;
					break;
				case MagicLevel.Level4:
					this.abilities[3] = new Eraser();
					this.abilities[3].api = this;
					break;
			}

			this.readout.setAbilities(this.abilities);
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
		for (const room of this.dungeonGenerator.rooms) {
			this.entities.push(...room.entities);
		}

		for (const entity of this.entities) {
			entity.api = this;
			entity.health = entity.maxHealth;
		}
	}
}
