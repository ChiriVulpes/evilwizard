
const seed = [6];

export function Random (max: number, seeded?: boolean): number;
export function Random (min: number, max: number, seeded?: boolean): number;
export function Random (min: number, max?: number | boolean, seeded = true) {
	if (typeof max === "boolean") {
		seeded = max;
		max = undefined;
	}

	if (max === undefined) {
		max = min;
		min = 0;
	}

	if (seeded) {
		seed[0] = (seed[0] * 9301 + 49297) % 233280;
	}

	return min + (seeded ? seed[0] / 233280 : Math.random()) * (max - min);
}

export module Random {
	export function int (max: number, seeded?: boolean): number;
	export function int (min: number, max: number, seeded?: boolean): number;
	export function int (min: number, max?: number | boolean, seeded?: boolean) {
		return Math.floor(Random(min, max as any, seeded));
	}

	export function chance (c: number, seeded?: boolean) {
		return Random(1, seeded) <= c;
	}

	/**
	 * Must be an enum with auto-assigned numeric values
	 */
	export function enumMember<T extends number = number>(e: any, seeded?: boolean): T {
		return Random.int(Object.keys(e).length / 2, seeded) as any;
	}

	export function pushSeed (s: number) {
		seed.unshift(s);
	}

	export function popSeed () {
		seed.shift();
	}
}
