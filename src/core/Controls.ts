export class Controls {
	private listener: (event: KeyboardEvent | MouseEvent) => any;
	private handlers: { [key: string]: Array<() => any> };
	private states: { [key: string]: true };

	public start () {
		this.handlers = {};
		this.states = {};

		this.listener = event => {
			const pressName = event instanceof MouseEvent ? `Mouse${event.button}` : event.code;
			if (event.type.endsWith("up")) {
				delete this.states[pressName];

			} else {
				this.states[pressName] = true;
				if (this.handlers[pressName]) {
					for (const handler of this.handlers[pressName]) {
						handler();
					}
				}
			}
		};

		document.addEventListener("mousedown", this.listener);
		document.addEventListener("keydown", this.listener);
		document.addEventListener("mouseup", this.listener);
		document.addEventListener("keyup", this.listener);
	}

	public stop () {
		document.removeEventListener("mousedown", this.listener);
		document.removeEventListener("keydown", this.listener);
		document.removeEventListener("mouseup", this.listener);
		document.removeEventListener("keyup", this.listener);
	}

	public onDown (press: string, cb: () => any) {
		this.handlers[press].push(cb);
	}

	public isDown (press: string) {
		return !!this.states[press];
	}
}
