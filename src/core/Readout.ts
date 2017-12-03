import { Ability, AbilityType } from "core/Ability";
import { MagicLevel, magicLevels } from "core/Api";
import { IVector } from "util/Vector";

export enum NumberType {
	Damage,
	Magic,
	Heal,
}

export class Readout {
	public setMagic (amt: number) {
		let lastAmount = 0;
		for (const l in magicLevels) {
			const levelAmount = magicLevels[l as keyof typeof magicLevels];
			const level = +l as MagicLevel;
			const guage = document.querySelector(`guage[level="${MagicLevel[level]}"]`) as HTMLElement;

			guage.style.setProperty("--amt",
				`${amt === 0 ? amt : Math.min(1, Math.max(0, (amt - lastAmount) / (levelAmount - lastAmount)))}`,
			);

			lastAmount = levelAmount;
		}
	}

	public setHealth (health: number, maxHealth: number) {
		const guage = document.querySelector("guage[level=\"Health\"]") as HTMLElement;
		guage.style.setProperty("--amt",
			`${health === 0 ? health : Math.min(1, Math.max(0, health / maxHealth))}`,
		);
	}

	public setAbilities (abilities: Ability[]) {
		const abilitiesElement = document.getElementById("abilities")!;
		for (let i = 0; i < 4 && abilities[i]; i++) {
			const slot = abilitiesElement.children[i];
			slot.setAttribute("ability", AbilityType[abilities[i].type]);
		}
	}

	public showNumber (type: NumberType, amt: number, position: IVector) {
		const el = document.createElement("div");
		el.classList.add("number", NumberType[type].toLowerCase());
		el.style.top = `${position.y}px`;
		el.style.left = `${position.x}px`;
		el.textContent = `${amt > 0 ? "+" : ""}${amt.toFixed(1)}`;
		document.getElementById("numbers")!.appendChild(el);
		setTimeout(() => {
			el.remove();
		}, 2000);
	}
}
