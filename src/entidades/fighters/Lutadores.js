import { Sprite } from "../Sprite.js";

export class lutadores extends Sprite {
    constructor({ nome, position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, velocidade = 100, isControlled = false }) {
        super({ position, imageSrc, scale, framesMax, offset });
        this.nome = nome;
        this.velocidade = velocidade;
        this.isControlled = this.isControlled;

    }

    update(secondsPassed, context) {
        this.position.x += this.velocidade * secondsPassed;

        const frameWidth = (this.image.width / this.framesMax) * this.scale;
        if (this.position.x > context.canvas.width - frameWidth || this.position.x < 0) {
            this.velocidade = -this.velocidade;
            this.flip = this.velocidade < 0; // vira o sprite conforme a direção
        }
        if (!this.isControlled) {
            const frameWidth = (this.image.width / this.framesMax) * this.scale;
            if (this.position.x > context.canvas.width - frameWidth || this.position.x < 0) {
                this.velocidade = -this.velocidade;
                this.flip = !this.flip;
            }
        }
        super.update(secondsPassed, context);
    }

    draw(context) {
        super.draw(context,this.flip);
    }
}