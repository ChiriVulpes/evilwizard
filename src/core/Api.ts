import { Readout } from "core/Readout";
import { Sound } from "core/Sound";
import { TileType } from "core/Tiles";
import { World } from "core/World";
import { Canvas } from "util/Canvas";
import { GameObject } from "util/GameObject";
import { IVector } from "util/Vector";

export interface IApi<Entity = GameObject, Player = GameObject> {
	entities: Entity[];
	world: World;
	readout: Readout;
	canvas: Canvas;
	player: Player;
	playerLevel: number;
	sounds: Sound;
	reset (): void;
	getCorpseAt (position: IVector): Entity | undefined;
	getEntityAt (position: IVector, exclude?: Entity[], offsetPosition?: boolean): Entity | undefined;
	addEntity (entity: Entity, position: IVector): void;
	removeEntity (corpse: Entity): void;
	getTileBlocker (position: IVector, exclude?: Entity[]): Entity | TileType | undefined;
}

export enum Direction {
	Down,
	Up,
	Right,
	Left,
}

export enum MagicLevel {
	None,
	Level1,
	Level2,
	Level3,
	Level4,
}

export const magicLevels: { [key: number]: number } = {
	[MagicLevel.Level1]: 25,
	[MagicLevel.Level2]: 75,
	[MagicLevel.Level3]: 200,
	[MagicLevel.Level4]: 500,
};
