export class TimeManager {
	public tickLength = 10;
	public timeout: number;
	private _isNewTick: boolean;
	private tickTime: number;
	private _realTime: number;
	private _tick: number;

	public get realTime () {
		return this._realTime;
	}
	public get isNewTick () {
		return this._isNewTick;
	}
	public get tick () {
		return this._tick;
	}
	public get canTick () {
		return this.tickTime == 0 && !this.timeout;
	}
	public get tickPercent () {
		return 1 - this.tickTime / this.tickLength;
	}

	public nextTick () {
		this._isNewTick = true;
		this.tickTime = this.tickLength;
	}
	public reset () {
		this._tick = 0;
		this._realTime = Date.now();
		this.tickTime = 0;
	}
	public update () {
		this._realTime = Date.now();
		if (this.tickTime) {
			this.tickTime--;
			this._isNewTick = false;

		} else if (this.timeout) {
			this.timeout--;
		}
	}
}
