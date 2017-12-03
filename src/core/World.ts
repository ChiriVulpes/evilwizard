import { TileType } from "core/Tiles";
import { Canvas, ISubTiles } from "util/Canvas";
import { IVector, Vector } from "util/Vector";

enum TileAdjacent {
	UpLeft = 1,
	Up = 2,
	UpRight = 4,
	Left = 8,
	Right = 16,
	DownLeft = 32,
	Down = 64,
	DownRight = 128,
}

const mappedTiles = [TileType.Grass, TileType.Path];

export class World {
	public tiles: TileType[];
	public mappings: number[];
	public size: IVector;

	constructor(size = Vector(64)) {
		this.size = size;
		this.tiles = new Array(this.size.x * this.size.y);
		this.mappings = new Array(this.size.x * this.size.y);
		this.clear();
	}

	public clear () {
		this.tiles.fill(TileType.None);
	}

	public remap () {
		for (let y = 0; y < this.size.y; y++) {
			for (let x = 0; x < this.size.x; x++) {
				if (mappedTiles.includes(this.getTile(x, y))) {
					this.mappings[this.getTileLocation(x, y)] = this.getTileMapping(x, y);
				}
			}
		}
	}

	public render (canvas: Canvas) {
		for (let y = 0; y < this.size.y; y++) {
			for (let x = 0; x < this.size.x; x++) {
				if (!canvas.isPositionVisible(x, y)) {
					continue;
				}

				const tile = this.getTile(x, y);
				if (tile == TileType.None) {
					continue;
				}

				canvas.drawSubTiles(canvas.getImageName(TileType[tile], "tile"),
					Vector(x, y),
					this.getSubTiles(this.mappings[this.getTileLocation(x, y)]),
				);
			}
		}
	}

	public getTile (x: number, y: number): TileType;
	public getTile (position: IVector): TileType;
	public getTile (x: number | IVector, y?: number): TileType;
	public getTile (x: number | IVector, y?: number) {
		return this.tiles[this.getTileLocation(x, y)];
	}
	public setTile (position: IVector, tile: TileType) {
		this.tiles[this.getTileLocation(position)] = tile;
	}

	private getSubTiles (mapping: number): ISubTiles {
		return {
			upLeft: this.getUpLeft(mapping),
			upRight: this.getUpRight(mapping),
			downLeft: this.getDownLeft(mapping),
			downRight: this.getDownRight(mapping),
		};
	}

	private getUpLeft (mapping: number) {
		if (mapping & TileAdjacent.Up) {
			if (mapping & TileAdjacent.Left) {
				return mapping & TileAdjacent.UpLeft ? 2 : 4;

			} else {
				return 14;
			}

		} else {
			return mapping & TileAdjacent.Left ? 12 : 0;
		}
	}

	private getUpRight (mapping: number) {
		if (mapping & TileAdjacent.Up) {
			if (mapping & TileAdjacent.Right) {
				return mapping & TileAdjacent.UpRight ? 3 : 5;

			} else {
				return 15;
			}

		} else {
			return mapping & TileAdjacent.Right ? 13 : 1;
		}
	}

	private getDownLeft (mapping: number) {
		if (mapping & TileAdjacent.Down) {
			if (mapping & TileAdjacent.Left) {
				return mapping & TileAdjacent.DownLeft ? 8 : 10;

			} else {
				return 20;
			}

		} else {
			return mapping & TileAdjacent.Left ? 18 : 6;
		}
	}

	private getDownRight (mapping: number) {
		if (mapping & TileAdjacent.Down) {
			if (mapping & TileAdjacent.Right) {
				return mapping & TileAdjacent.DownRight ? 9 : 11;

			} else {
				return 21;
			}

		} else {
			return mapping & TileAdjacent.Right ? 19 : 7;
		}
	}

	private getTileMapping (x: number, y: number): number;
	private getTileMapping (position: IVector): number;
	private getTileMapping (x: number | IVector, y = 0) {
		if (typeof x == "object") {
			y = x.y;
			x = x.x;
		}

		const tile = this.getTile(x, y);
		return (
			(this.getTile(x - 1, y - 1) == tile ? TileAdjacent.UpLeft : 0) |
			(this.getTile(x, y - 1) == tile ? TileAdjacent.Up : 0) |
			(this.getTile(x + 1, y - 1) == tile ? TileAdjacent.UpRight : 0) |
			(this.getTile(x - 1, y) == tile ? TileAdjacent.Left : 0) |
			(this.getTile(x + 1, y) == tile ? TileAdjacent.Right : 0) |
			(this.getTile(x - 1, y + 1) == tile ? TileAdjacent.DownLeft : 0) |
			(this.getTile(x, y + 1) == tile ? TileAdjacent.Down : 0) |
			(this.getTile(x + 1, y + 1) == tile ? TileAdjacent.DownRight : 0)
		);
	}

	private getTileLocation (x: number | IVector, y?: number) {
		if (typeof x == "object") {
			y = x.y;
			x = x.x;
		}

		return y! * this.size.x + x;
	}
}
