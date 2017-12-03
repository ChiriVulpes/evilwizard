// tslint:disable-next-line interface-name
interface Math {
	avg (...n: number[]): number;
}

Math.avg = (...n: number[]) => {
	return n.reduce((a, b) => a + b, 0) / n.length;
};
