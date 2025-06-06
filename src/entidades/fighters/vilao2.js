import { lutadores } from "./Lutadores.js";

export class Vilao2 extends lutadores {
    constructor({ position, velocidade }) {
        super({
            nome: "Vilao2",
            position,
            imageSrc: "../../../images/Homeless_2/Idle.png", 
            scale: 3,
            framesMax: 7,
            offset: { x: 0, y: 0 },
            velocidade
        });
        this.flip = true;
    }

    update(secondsPassed, context) {
        super.update(secondsPassed, context);
    }
}
