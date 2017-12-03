import { Readout } from "core/Readout";
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
	getCorpseAt (position: IVector): Entity | undefined;
	removeEntity (corpse: Entity): void;
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
	[MagicLevel.Level1]: 20,
	[MagicLevel.Level2]: 50,
	[MagicLevel.Level3]: 100,
	[MagicLevel.Level4]: 500,
};
