import { World } from "core/World";
import { GameObject } from "util/GameObject";

export interface IApi<Entity = GameObject> {
	entities: Entity[];
	world: World;
}

export enum Direction {
	Down,
	Up,
	Right,
	Left,
}
