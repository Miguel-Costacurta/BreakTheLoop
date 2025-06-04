import { Sprite } from "../Sprite.js";

export class lutadores extends Sprite {
    constructor({ nome, position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, velocidade = 100 }) {
        super({ position, imageSrc, scale, framesMax, offset });
        this.nome = nome;
        this.velocidade = velocidade;
    }

    update(secondsPassed, context) {
        this.position.x += this.velocidade * secondsPassed;

        const frameWidth = (this.image.width / this.framesMax) * this.scale;
        if (this.position.x > context.canvas.width - frameWidth || this.position.x < 0) {
            this.velocidade = -this.velocidade;
        }

        super.update(secondsPassed, context);
    }

    draw(context) {
        super.draw(context);
    }
}