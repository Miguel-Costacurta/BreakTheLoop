export class Cenario {
    constructor() {
        this.image = document.querySelector('img[alt="background"]');
    }
    update() {
        // Cenario estático - nada a atualizar por enquanto
    }

    draw(context) {
        if (this.image && this.image.complete) {
            context.drawImage(this.image, 0, 0, context.canvas.width, context.canvas.height
            );
        }
    }
}