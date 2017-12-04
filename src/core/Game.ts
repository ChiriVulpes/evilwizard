import { DarkHand } from "abilities/DarkHand";
import { Eraser } from "abilities/Eraser";
import { Fireball } from "abilities/Fireball";
import { Heal } from "abilities/Heal";
import { Ability, AbilityType } from "core/Ability";
import { Direction, IApi, MagicLevel, magicLevels } from "core/Api";
import { Controls } from "core/Controls";
import { DungeonGenerator } from "core/DungeonGenerator";
import { EntityType } from "core/Entities";
import { Entity, EntityState } from "core/Entity";
import { MessageType, Readout } from "core/Readout";
import { Sound, SoundType } from "core/Sound";
import { Tile, TileType } from "core/Tiles";
import { World } from "core/World";
import { EvilWizard } from "entities/EvilWizard";
import { Canvas } from "util/Canvas";
import { Random } from "util/Random";
import { TimeManager } from "util/TimeManager";
import { IVector, Vector } from "util/Vector";

const levelUpScaryMessages = [
	"You suddenly feel a chill up your spine...",
	"Something feels... off.",
	"Nature abruptly feels more threatening...",
	"You feel a wave of menace from all around you.",
];

export class Game implements IApi {
	public world: World;
	public canvas = new Canvas("game");
	public readout = new Readout();
	public player: EvilWizard;
	public playerLevel: MagicLevel;
	public sounds = new Sound();

	private _entities: Entity[];
	private slicedEntities: Entity[];
	public get entities (): Entity[] {
		return this.slicedEntities;
	}

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
	private abilities: Ability[];

	public async load () {
		await this.canvas.loadImages(TileType, "tile", [TileType.None]);
		await this.canvas.loadImages(EntityType, "entity");
		await this.sounds.load();
	}

	public start () {
		this.reset();
		this.controls.start();
		this.loop();
	}

	public reset () {
		this.time.reset();
		this.isRunning = true;
		this._entities = [];
		this.world = new World();
		this.addEntity(this.player = new EvilWizard(), Vector(
			Math.floor(this.world.size.x / 2),
			Math.floor(this.world.size.y / 2),
		));
		this.newLevel();
		this.playerLevel = MagicLevel.None;
		this.abilities = [];
		this.readout.reset();
		document.body.style.setProperty("--creepiness", `${0}`);
	}

	public stop () {
		this.isRunning = false;
		this.controls.stop();
	}

	public getTileBlocker (position: IVector, exclude?: Entity[]): TileType | Entity | undefined {
		const tile = this.world.getTile(position);
		if (!Tile.isWalkable(tile)) {
			return tile;
		}

		for (const entity of this.entities) {
			if (entity.state == EntityState.Dead || (exclude && exclude.includes(entity))) {
				continue;
			}


			if (entity.blocksTile(position)) {
				return entity;
			}
		}
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

	public getEntityAt (position: IVector, exclude?: Entity[], offsetPosition = false): Entity | undefined {
		for (const entity of this.entities) {
			if (exclude && exclude.includes(entity)) {
				continue;
			}

			let entityPosition = entity.position;
			if (offsetPosition) {
				entityPosition = entity.getOffsetPosition();
			}

			if (entityPosition.x == position.x && entityPosition.y == position.y) {
				return entity;
			}
		}
	}

	public addEntity (entity: Entity, position: IVector) {
		entity.api = this;
		entity.position = position;
		entity.health = entity.maxHealth;
		this._entities.push(entity);
	}

	public removeEntity (corpse: Entity) {
		const index = this._entities.findIndex(e =>
			e.position.x == corpse.position.x && e.position.y == corpse.position.y && e.type == corpse.type,
		);
		if (index >= 0) {
			this._entities.splice(index, 1);
		}
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
			const shift = this.controls.isDown("ShiftLeft");
			if (shift) {
				if (this.controls.isDown("KeyW")) {
					this.player.direction = Direction.Up;

				} else if (this.controls.isDown("KeyA")) {
					this.player.direction = Direction.Left;

				} else if (this.controls.isDown("KeyS")) {
					this.player.direction = Direction.Down;

				} else if (this.controls.isDown("KeyD")) {
					this.player.direction = Direction.Right;
				}

				this.player.animation = this.player.direction as any;

			} else {
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

				}
			}

			if (this.controls.isDown("Space")) {
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

		this.slicedEntities = this._entities.slice().sort((a, b) =>
			(a.state == EntityState.Dead ? -Infinity : a.position.y) - (b.state == EntityState.Dead ? -Infinity : b.position.y),
		);
		for (const object of this.entities) {
			object.update(this.time);
		}

		this.readout.setMagic(this.player.magic);
		this.readout.setHealth(this.player.health, this.player.maxHealth);
		if (this.player.magic >= magicLevels[this.playerLevel + 1]) {
			this.levelUp();
		}
	}

	private levelUp () {
		this.readout.showMessage(MessageType.Good, `You are now level ${this.playerLevel + 2}!`);

		this.playerLevel++;
		switch (this.playerLevel) {
			case MagicLevel.Level1:
				this.abilities[0] = new Fireball();
				this.abilities[0].api = this;
				break;
			case MagicLevel.Level2:
				this.abilities[1] = new Heal();
				this.abilities[1].api = this;
				break;
			case MagicLevel.Level3:
				this.abilities[2] = new DarkHand();
				this.abilities[2].api = this;
				break;
			case MagicLevel.Level4:
				this.abilities[3] = new Eraser();
				this.abilities[3].api = this;
				break;
		}

		this.player.maxHealth *= 2;
		this.readout.showMessage(MessageType.Heal, `Your max health is now ${this.player.maxHealth}!`);

		this.readout.setAbilities(this.abilities);
		this.readout.showMessage(MessageType.Magic,
			`You gained a new ability... ${AbilityType[this.abilities[this.abilities.length - 1].type]}`,
		);

		if (this.playerLevel == MagicLevel.Level4) {
			this.readout.showMessage(MessageType.Bad, "You have achieved the power you always desired.");

		} else {
			this.readout.showMessage(MessageType.Bad, levelUpScaryMessages[Random.int(levelUpScaryMessages.length)]);
		}

		document.body.style.setProperty("--creepiness", `${this.playerLevel / (Object.keys(magicLevels).length + 1)}`);

		this.time.timeout = 100;

		this.sounds.play(SoundType.LevelUp);
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
			for (const entity of room.entities) {
				if (entity.position.x == this.player.position.x && entity.position.y == this.player.position.y) {
					continue;
				}

				entity.api = this;
				entity.health = entity.maxHealth;

				this._entities.push(entity);
			}
		}
	}
}
