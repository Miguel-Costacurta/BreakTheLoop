import { lutadores } from "./Lutadores.js";

export class principalCharacter extends lutadores {
    constructor({ position }) {
        super({
            nome: "Corleone",
            position,
            imageSrc: '../../../images/Gangsters_1/Idle_2.png',
            scale: 3,
            framesMax: 11,
            offset: { x: 0, y: 0 },
            velocidade: 100
        });
    }

    update(secondsPassed, context) {
        super.update(secondsPassed, context);
    }
}