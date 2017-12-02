import { Tile } from "core/Tiles";
import { World } from "core/World";
import * as Random from "util/Random";
import { IVector, Vector } from "util/Vector";

export interface IRoom {
	size: IVector;
	position: IVector;
}

function roomIntersects (a: IRoom, b: IRoom, padding = 0) {
	return a.position.x + a.size.x + padding > b.position.x && a.position.x - padding < b.position.x + b.size.x &&
		a.position.y + a.size.y + padding > b.position.y && a.position.y - padding < b.position.y + b.size.y;
}

export class DungeonGenerator {
	public rooms: IRoom[] = [];

	private world: World;

	public generate (world: World) {
		this.world = world;
		this.rooms = [];
		world.clear();

		const firstRoom = this.generateRoom();
		firstRoom.position = Vector(
			Math.floor(world.size.x / 2 - firstRoom.size.x / 2),
			Math.floor(world.size.y / 2 - firstRoom.size.y / 2),
		);
		this.addRoom(firstRoom);

		for (let i = 0; i < 7; i++) {
			let room: IRoom;
			do {
				room = this.generateRoom();
			} while (this.roomIntersects(room));

			this.addRoom(room);
		}

		world.remap();
	}

	private addRoom (room: IRoom) {
		this.rooms.push(room);
		for (let y = room.position.y; y < room.position.y + room.size.y; y++) {
			for (let x = room.position.x; x < room.position.x + room.size.x; x++) {
				this.world.setTile(Vector(x, y), Tile.Grass);
			}
		}
	}
	private roomIntersects (room: IRoom) {
		for (const existingRoom of this.rooms) {
			if (roomIntersects(room, existingRoom, 1)) {
				return true;
			}
		}

		return false;
	}

	private generateRoom (): IRoom {
		const size = Vector(Random.int(5, 10), Random.int(5, 10));
		const position = Vector(
			Random.int(0, this.world.size.x - size.x),
			Random.int(0, this.world.size.y - size.y),
		);

		return { size, position };
	}
}
