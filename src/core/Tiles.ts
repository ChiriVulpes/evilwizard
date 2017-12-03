export enum TileType {
	None,
	Grass,
	Path,
}
export module Tile {
	export function isWalkable (tile: TileType) {
		return tile != TileType.None;
	}
}
