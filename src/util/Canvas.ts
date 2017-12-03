import { IVector, Vector } from "util/Vector";

export interface ISubTiles {
	upLeft: number;
	upRight: number;
	downLeft: number;
	downRight: number;
}

interface IViewport {
	position: IVector;
	size: IVector;
}

export class Canvas {
	private canvasElement: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private images: { [key: string]: HTMLImageElement } = {};
	private scale = 3;
	private viewport: IViewport;

	public set viewportPosition (position: IVector) {
		this.viewport.position.x = Math.floor(position.x * 16) * this.scale - Math.floor(this.viewport.size.x / 2);
		this.viewport.position.y = Math.floor(position.y * 16) * this.scale - Math.floor(this.viewport.size.y / 2);
	}

	constructor(id: string) {
		this.canvasElement = document.getElementById(id) as HTMLCanvasElement;
		this.reestablishContext();
		window.addEventListener("resize", () => this.reestablishContext());
	}

	public async loadImages (imageEnum: any, location: string, except?: number[]) {
		const promises: Promise<any>[] = [];

		const keys = Object.keys(imageEnum).length / 2;
		for (let i = 0; i < keys; i++) {
			if (except && except.includes(i)) {
				continue;
			}

			const imageName = this.getImageName(imageEnum[i], location);
			this.images[imageName] = new Image();
			promises.push(new Promise<any>(r => this.images[imageName].onload = r));
			this.images[imageName].src = `./static/img/${imageName}.png`;
		}

		return Promise.all(promises);
	}

	public getImageName (image: string, location: string) {
		return `${location}/${image.toLowerCase()}`;
	}

	public clear () {
		this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
	}

	public drawSubTiles (imageName: string, drawPosition: IVector, subtiles: ISubTiles) {
		const image = this.images[imageName];
		this.drawImageViewport(image,
			drawPosition.x * 16,
			drawPosition.y * 16,
			this.getImagePosition(image, subtiles.upLeft, 8),
			Vector(8),
		);
		this.drawImageViewport(image,
			drawPosition.x * 16 + 8,
			drawPosition.y * 16,
			this.getImagePosition(image, subtiles.upRight, 8),
			Vector(8),
		);
		this.drawImageViewport(image,
			drawPosition.x * 16,
			drawPosition.y * 16 + 8,
			this.getImagePosition(image, subtiles.downLeft, 8),
			Vector(8),
		);
		this.drawImageViewport(image,
			drawPosition.x * 16 + 8,
			drawPosition.y * 16 + 8,
			this.getImagePosition(image, subtiles.downRight, 8),
			Vector(8),
		);
	}

	public drawFrame (imageName: string, animation: number, frame: number, position: IVector) {
		const image = this.images[imageName];
		this.drawImageViewport(image,
			position.x * 16,
			position.y * 16,
			{
				x: frame * 16,
				y: animation * 16,
			},
			Vector(16),
		);
	}

	public isPositionVisible (x: number, y: number) {
		const s = 16 * this.scale;
		return x * s + s >= this.viewport.position.x && x * s < this.viewport.position.x + this.viewport.size.x &&
			y * s + s >= this.viewport.position.y && y * s < this.viewport.position.y + this.viewport.size.y;
	}

	public getScreenPosition (position: IVector) {
		return Vector(
			position.x * 16 * this.scale - this.viewport.position.x,
			position.y * 16 * this.scale - this.viewport.position.y,
		);
	}

	private getImagePosition (img: HTMLImageElement, tile: number, size: number): IVector {
		return {
			x: (tile % (img.width / size)) * size,
			y: Math.floor(tile / (img.width / size)) * size,
		};
	}

	private drawImageViewport (img: HTMLImageElement,
		drawX: number,
		drawY: number,
		imgPosition: IVector,
		imgSize: IVector,
	) {
		this.context.drawImage(img,
			imgPosition.x,
			imgPosition.y,
			imgSize.x,
			imgSize.y,
			Math.floor(drawX) * this.scale - this.viewport.position.x,
			Math.floor(drawY) * this.scale - this.viewport.position.y,
			imgSize.x * this.scale,
			imgSize.y * this.scale,
		);
	}

	private reestablishContext () {
		this.canvasElement.width = window.innerWidth;
		this.canvasElement.height = window.innerHeight;
		this.context = this.canvasElement.getContext("2d")!;
		this.context.imageSmoothingEnabled = false;
		this.viewport = {
			position: Vector.Zero(),
			size: Vector(window.innerWidth, window.innerHeight),
		};
	}
}
