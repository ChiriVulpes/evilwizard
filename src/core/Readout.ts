import { Ability, AbilityType } from "core/Ability";
import { MagicLevel, magicLevels } from "core/Api";
import { EntityType } from "core/Entities";
import { CritType, IDamageResult } from "core/Entity";
import { IVector } from "util/Vector";

export enum MessageType {
	Damage,
	Magic,
	Heal,
	Fight,
	Good,
	Bad,
}

function getLetterPosition (letter: string): IVector | undefined {
	if (letter == " ") {
		return undefined;
	}

	let index: number;
	if (isNaN(+letter)) {
		switch (letter) {
			case "+": index = 36; break;
			case "-": index = 37; break;
			case ".": index = 38; break;
			case "!": index = 39; break;
			default: index = 10 + letter.toLowerCase().charCodeAt(0) - 97; break;
		}

	} else {
		index = +letter;
	}

	return {
		x: index % 10,
		y: Math.floor(index / 10),
	};
}

function capitalize (text: string) {
	return text[0].toUpperCase() + text.slice(1);
}

export class Readout {
	private messagesEnabled: boolean;

	public reset () {
		this.setMagic(0);
		this.setHealth(1, 1);
		this.setAbilities([]);
		const messages = document.getElementById("messages")!;
		messages.innerHTML = "";
		this.messagesEnabled = true;
	}

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
		for (let i = 0; i < 4; i++) {
			const slot = abilitiesElement.children[i];
			if (abilities[i]) {
				slot.setAttribute("ability", AbilityType[abilities[i].type]);

			} else {
				slot.removeAttribute("ability");
			}
		}
	}

	public showNumber (type: MessageType, amt: number, position: IVector) {
		const text = this.getText(type, `${amt > 0 ? "+" : ""}${amt.toFixed(1)}`);
		text.classList.add("slide", "color");
		text.style.top = `${position.y}px`;
		text.style.left = `${position.x}px`;
		document.getElementById("numbers")!.appendChild(text);
		setTimeout(() => {
			text.remove();
		}, 2000);
	}

	public showMessage (type: MessageType, text: string) {
		if (this.messagesEnabled) {
			const el = this.getText(type, text);
			const messages = document.getElementById("messages")!;
			messages.appendChild(el);
			if (messages.children.length > 5) {
				messages.firstElementChild!.remove();
			}
		}
	}

	public disableMessages () {
		this.messagesEnabled = false;
	}

	public showDamageResult (damageResult: IDamageResult, type = MessageType.Damage) {
		const sourceName = this.getName(damageResult.source, true);
		const targetName = this.getName(damageResult.target);
		const sentences = [`${sourceName} hit ${targetName} for ${damageResult.amt.toFixed(1)}`];

		let and: boolean | undefined;
		if (damageResult.effectiveness != 0) {
			if (damageResult.effectiveness > 0) {
				sentences.push("was effective");
				and = true;

			} else {
				sentences.push("was not effective");
				and = false;
			}
		}

		switch (damageResult.crit) {
			case CritType.Fail:
				sentences.push("was a critical failure!");
				and = !and;

				break;
			case CritType.Success:
				sentences.push("was a critical success!");

				break;
		}

		switch (sentences.length) {
			case 1:
				this.showMessage(type, `${sentences[0]}.`);
				return;
			case 2:
				this.showMessage(type, `${sentences[0]}. It ${sentences[1]}${sentences[1].endsWith("!") ? "" : "."}`);
				return;
			case 3:
				this.showMessage(type,
					`${sentences[0]}. It ${sentences[1]} ${and ? "and" : "but"} it ${sentences[2]}`,
				);
				return;
		}
	}

	public getName (entityType: EntityType, shouldCapitalize = false): string {
		if (shouldCapitalize) {
			return capitalize(this.getName(entityType));
		}

		switch (entityType) {
			case EntityType.EvilWizard: return "you";
			default: return `a ${EntityType[entityType]}`;
		}
	}


	private getText (type: MessageType, text: string) {
		text = text.replace(/\s+/g, " ").trim();
		const result = document.createElement("div");
		result.classList.add("text", MessageType[type].toLowerCase());
		for (const letter of text) {
			const l = document.createElement("div");
			l.classList.add("letter");
			if (letter.toLowerCase() == "i" || letter == "1") {
				l.classList.add("i");
			}

			const position = getLetterPosition(letter);
			if (position) {
				l.style.setProperty("--tilex", `${position.x}`);
				l.style.setProperty("--tiley", `${position.y}`);

			} else {
				l.classList.add("space");
			}

			result.appendChild(l);
		}

		return result;
	}
}
