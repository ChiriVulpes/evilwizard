import { Direction } from "core/Api";
import { TileType } from "core/Tiles";
import { World } from "core/World";
import * as Random from "util/Random";
import { IVector, Vector } from "util/Vector";

export interface IRoom {
	size: IVector;
	position: IVector;
	pathsTo?: IRoom[];
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

		const firstRoom = this.generateRoom(10, 15);
		firstRoom.position = Vector(
			Math.floor(world.size.x / 2 - firstRoom.size.x / 2),
			Math.floor(world.size.y / 2 - firstRoom.size.y / 2),
		);
		this.addRoom(firstRoom);

		this.generateRooms(5, 8, 15);
		this.generateRooms(15, 5, 7);

		this.addPaths();

		world.remap();
	}

	private generateRooms (count: number, minSize: number, maxSize: number) {
		for (let i = 0; i < count; i++) {
			let room: IRoom;
			let tries = 0;
			do {
				room = this.generateRoom(minSize, maxSize);
				tries++;
				if (tries > 50 && tries % 3 === 0) {
					minSize = Math.max(5, minSize--);
					maxSize = Math.max(5, maxSize--);
				}

				if (tries > 100) {
					return;
				}
			} while (this.roomIntersects(room));

			this.addRoom(room);
		}
	}

	private addPaths () {
		for (const room of this.rooms) {
			const nearestRooms = this.getNearestRooms(room, Random.int(1, 4));
			for (const nearRoom of nearestRooms) {
				const start = this.getRandomEdge(room, nearRoom.closestSide);
				this.drawPath(start, nearRoom.closestSide, nearRoom.room);
			}
		}
	}

	private drawPath (start: IVector, direction: Direction, to: IRoom) {
		let target = this.getPathCornerTarget(direction, to);
		const pos = Vector(start);
		let tries = 0;
		for (; !this.isAtTarget(pos, direction, target); this.movePositionDirection(pos, direction)) {
			tries++;
			if (tries > 100) {
				return;
			}

			if (!this.world.getTile(pos)) {
				this.world.setTile(pos, TileType.Grass);
			}
		}

		if (this.isInRoom(pos, to)) {
			return;
		}

		direction = this.getDirection(pos, to);
		target = this.getPathTarget(direction, to);
		for (; !this.isAtTarget(pos, direction, target); this.movePositionDirection(pos, direction)) {
			tries++;
			if (tries > 100) {
				return;
			}

			if (!this.world.getTile(pos)) {
				this.world.setTile(pos, TileType.Grass);
			}
		}
	}

	private getDirection (position: IVector, room: IRoom) {
		if (position.x >= room.position.x && position.x < room.position.x + room.size.x) {
			return position.y > room.position.y ? Direction.Up : Direction.Down;

		} else {
			return position.x > room.position.x ? Direction.Left : Direction.Right;
		}
	}
	private getPathTarget (direction: Direction, room: IRoom) {
		switch (direction) {
			case Direction.Up: return room.position.y + room.size.y - 1;
			case Direction.Down: return room.position.y;
			case Direction.Left: return room.position.x + room.size.x - 1;
			case Direction.Right: return room.position.x;
		}
	}

	private isAtTarget (position: IVector, direction: Direction, target: number) {
		switch (direction) {
			case Direction.Down:
			case Direction.Up:
				return position.y == target;
			case Direction.Left:
			case Direction.Right:
				return position.x == target;
		}
	}

	private isInRoom (position: IVector, room: IRoom) {
		return position.x >= room.position.x && position.x < room.position.x + room.size.x &&
			position.y >= room.position.y && position.y < room.position.y + room.size.y;
	}

	private movePositionDirection (position: IVector, direction: Direction) {
		if (direction == Direction.Up) {
			position.y -= 1;

		} else if (direction == Direction.Down) {
			position.y += 1;

		} else if (direction == Direction.Left) {
			position.x -= 1;

		} else if (direction == Direction.Right) {
			position.x += 1;
		}
	}

	private getPathCornerTarget (direction: Direction, to: IRoom) {
		switch (direction) {
			case Direction.Down:
			case Direction.Up:
				return to.position.y + Random.int(to.size.y);
			case Direction.Left:
			case Direction.Right:
				return to.position.x + Random.int(to.size.x);
		}
	}

	private getRandomEdge (room: IRoom, side: Direction) {
		switch (side) {
			case Direction.Down: return Vector(room.position.x + Random.int(room.size.x), room.position.y + room.size.y);
			case Direction.Left: return Vector(room.position.x, room.position.y + Random.int(room.size.y));
			case Direction.Right: return Vector(room.position.x + room.size.x, room.position.y + Random.int(room.size.y));
			case Direction.Up: return Vector(room.position.x + Random.int(room.size.x), room.position.y);
		}
	}

	private getNearestRooms (roomA: IRoom, count: number) {
		const nearestRooms: Array<{
			room: IRoom;
			distance: number;
			closestSide: Direction;
		}> = [];

		for (const room of this.rooms) {
			if (room === roomA) {
				continue;
			}

			const distanceX = Math.max(
				Math.abs(room.position.x + room.size.x - roomA.position.x),
				Math.abs(roomA.position.x + roomA.size.x - room.position.x),
			);
			const distanceY = Math.max(
				Math.abs(room.position.y + room.size.y - roomA.position.y),
				Math.abs(roomA.position.y + roomA.size.y - room.position.y),
			);
			nearestRooms.push({
				room,
				distance: Math.avg(distanceX, distanceY),
				closestSide: (distanceX > distanceY ?
					(
						room.position.x > roomA.position.x ? Direction.Right : Direction.Left
					) : (
						room.position.y > roomA.position.y ? Direction.Down : Direction.Up
					)
				),
				distanceX,
				distanceY,
			} as any);
		}

		nearestRooms.sort((a, b) => a.distance - b.distance).splice(count);

		return nearestRooms;
	}

	private addRoom (room: IRoom) {
		this.rooms.push(room);
		for (let y = room.position.y; y < room.position.y + room.size.y; y++) {
			for (let x = room.position.x; x < room.position.x + room.size.x; x++) {
				this.world.setTile(Vector(x, y), TileType.Grass);
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

	private generateRoom (min: number, max: number): IRoom {
		const size = Vector(Random.int(min, max), Random.int(min, max));
		const position = Vector(
			Random.int(0, this.world.size.x - size.x),
			Random.int(0, this.world.size.y - size.y),
		);

		return { size, position };
	}
}
