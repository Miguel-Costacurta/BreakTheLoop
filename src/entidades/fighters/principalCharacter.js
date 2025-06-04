import { lutadores } from "./Lutadores.js";

export class principalCharacter extends lutadores {
    constructor({ position }) {
        super({
            nome: "Bred",
            position,
            imageSrc: '../../../images/Gangsters_1/idle.png',
            scale: 1.5,
            framesMax: 6,
            offset: { x: 0, y: 0 },
            velocidade: 100
        });
    }

    update(secondsPassed, context) {
        super.update(secondsPassed, context);
    }
}