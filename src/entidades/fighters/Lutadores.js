import { Sprite } from "../Sprite.js";
import { Projetil } from "./Projetil.js";

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
        this.health = 100;
        this.hitbox = {
            offset: {x:130, y:165},
            width:100,
            height:225,
        };
        this.atacando = false;
        this.tempoAtaque = 0;
        this.duracaoAtaque = 20;
        this.projeteis =[];
        this.morto = false;
    }

    matar() {
    if (!this.morto) {
        console.log(`${this.nome} morreu!`);
        this.morto = true;
        this.switchSprite && this.switchSprite("death");
        this.velocidade.x = 0;
        this.velocidade.y = 0;
    }
}

    atacar(){
        if (this.morto) return;
        if (!this.atacando){
            this.atacando = true;
            this.tempoAtaque = 0;

            const proj = new Projetil({
                position:{ x: this.position.x + (this.flip ? -10 : 80), y: this.position.y + 250},
                velocidade: { x: 8 },
                direction: this.flip ? -1 : 1
            });
            this.projeteis.push(proj);
        }
    }

    getHitBox(){
        return{
            x:this.position.x + this.hitbox.offset.x,
            y:this.position.y + this.hitbox.offset.y,
            width:this.hitbox.width,
            height:this.hitbox.height
        };
    }

    getAttackHitBox(){
        return{
            x:this.position.x + (this.flip ? -30 :50),
            y: this.position.y,
            width:50,
            height:50
        };
    };

    takeDamage(dano){
        this.health -= dano;
        console.log(`${this.nome} levou dano! Vida restante: ${this.health}`);
        if(this.health <= 0){
            console.log(`${this.nome} morreu!`);
            this.matar();
        }else{
            this.switchSprite && this.switchSprite("hit");
        }
    }

    update(secondsPassed, context) {
         if (this.morto) {
            this.switchSprite && this.switchSprite("death"); // fixa sprite de morte
            return; // não atualiza física, etc.
        }
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

        const barraLargura = 80;
        const barraAltura = 10;
        const spriteLargura = (this.image.width / this.framesMax) * this.scale;
        const barraX = this.position.x + (spriteLargura / 2) - (barraLargura / 2);
        const barraY = this.position.y + 130;
        const vidaRestante = (this.health / 100) * barraLargura;

        // Fundo da barra
        context.fillStyle = 'gray';
        context.fillRect(barraX, barraY, barraLargura, barraAltura);

        // Barra vermelha (vida atual)
        context.fillStyle = 'red';
        context.fillRect(barraX, barraY, vidaRestante, barraAltura);

        // Borda da barra
        context.strokeStyle = 'black';
        context.strokeRect(barraX, barraY, barraLargura, barraAltura);

        // DEBUG: desenhar a hitbox
        const hitbox = this.getHitBox();
        context.strokeStyle = 'red';
        context.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

        if (this.atacando) {
            const atk = this.getAttackHitBox();
            context.strokeStyle = 'blue';
            context.strokeRect(atk.x, atk.y, atk.width, atk.height);
        }

    }
}