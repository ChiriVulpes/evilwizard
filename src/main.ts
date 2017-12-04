import { Game } from "core/Game";
import "util/Number";

const game = new Game();
game.load().then(() => {
	document.title = "Evil Wizard";
	game.start();
});
(window as any).game = game;
