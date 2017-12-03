import { Game } from "core/Game";
import "util/Number";

const game = new Game();
game.load().then(() => {
	game.start();
});
(window as any).game = game;
