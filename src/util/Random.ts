
export function Random (max: number): number;
export function Random (min: number, max: number): number;
export function Random (min: number, max?: number) {
	if (max === undefined) {
		max = min;
		min = 0;
	}

	return min + Math.random() * (max - min);
}

export module Random {
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

	/**
	 * Must be an enum with auto-assigned numeric values
	 */
	export function enumMember<T extends number = number>(e: any): T {
		return Random.int(Object.keys(e).length / 2) as any;
	}
}

