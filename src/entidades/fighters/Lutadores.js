import { Sprite } from "../Sprite.js";

export class lutadores extends Sprite {
    constructor({ nome, position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, isControlled = false }) {
        super({ position, imageSrc, scale, framesMax, offset });
        this.nome = nome;
        this.velocidade = {
            x:0,
            y:0
        };
        this.isControlled = isControlled;
        this.gravity = 0.5;
        this.noChao = false;
    }

    update(secondsPassed, context) {
        //Aplicar gravidade no jogo
        this.velocidade.y += this.gravity;
        //Metodo novo para atualizar as posições
        this.position.x += this.velocidade.x;
        this.position.y += this.velocidade.y;

        //Cria um chao imaginario
        const chaoY = context.canvas.height - 450;
        if(this.position.y >= chaoY){
            this.position.y = chaoY;
            this.velocidade.y = 0;
            this.noChao = true; //personagem no chao
        }else{
            this.noChao = false; //personagem no ar
        }

        // definindo limites da esquerda
        const frameWidth = (this.image.width / this.framesMax) * this.scale;
        if(this.position.x < 0){
            this.position.x = 0;
        }
        // limites da direita
        if(this.position.x + frameWidth > window.innerWidth){
            this.position.x = window.innerWidth - frameWidth;
        }
        // define o flip dependedo da direcao que o personagem esta
        if (this.position.x > context.canvas.width - frameWidth || this.position.x < 0) {
            this.velocidade.x = -this.velocidade.x;
            this.flip = this.velocidade.x < 0; // vira o sprite conforme a direção
        }
        // caso ele n seja controlavel esse flip eh definido automaticamente por essa parte
        if (!this.isControlled) {
            const frameWidth = (this.image.width / this.framesMax) * this.scale;
            if (this.position.x > context.canvas.width - frameWidth || this.position.x < 0) {
                this.velocidade.x = -this.velocidade.x;
                this.flip = !this.flip;
            }
        }
        super.update(secondsPassed, context);
    }

    draw(context) {
        super.draw(context,this.flip);
    }
}