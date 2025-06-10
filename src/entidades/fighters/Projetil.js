export class Projetil {
    constructor({ position, velocidade, direction }) {
        this.position = { ...position };
        this.velocidade = velocidade;
        this.width = 10;
        this.height = 3;
        this.direction = direction;
        this.dano = 4;
    }

    update() {
        this.position.x += this.velocidade.x * this.direction;
    }

    draw(context) {
        context.fillStyle = 'yellow';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    getHitBox() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }
}
