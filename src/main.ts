import { Game } from "core/Game";

const game = new Game();
game.load().then(() => {
	game.start();
});
(window as any).game = game;
