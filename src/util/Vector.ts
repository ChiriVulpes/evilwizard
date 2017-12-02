export interface IVector {
	x: number;
	y: number;
}

export function Vector (v: IVector): IVector;
export function Vector (xy: number): IVector;
export function Vector (x: number, y: number): IVector;
export function Vector (x: number | IVector, y?: number): IVector {
	if (typeof x == "object") {
		y = x.y;
		x = x.x;

	} else if (y === undefined) {
		y = x;
	}

	return { x, y };
}
export module Vector {
	export function Zero () {
		return Vector(0);
	}
	export function One () {
		return Vector(1);
	}
}
