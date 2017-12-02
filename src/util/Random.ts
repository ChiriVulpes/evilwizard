export function int (max: number): number;
export function int (min: number, max: number): number;
export function int (min: number, max?: number) {
	if (max === undefined) {
		max = min;
		min = 0;
	}

	return min + Math.floor(Math.random() * (max - min));
}

export function chance (c: number) {
	return Math.random() <= c;
}
