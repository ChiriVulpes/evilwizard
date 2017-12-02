import { Canvas } from "util/Canvas";
import { TimeManager } from "util/TimeManager";

export abstract class GameObject {
	public abstract update (time: TimeManager): any;
	public abstract render (time: TimeManager, canvas: Canvas): any;
}
