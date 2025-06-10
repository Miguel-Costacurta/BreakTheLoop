import { lutadores } from "./Lutadores.js";

export class principalCharacter extends lutadores {
    constructor({ position, velocidade }) {
        super({
            nome: "Corleone",
            position,
            imageSrc: '../../../images/Gangsters_1/Idle_2.png',
            scale: 3,
            framesMax: 11,
            offset: { x: 0, y: 0 },
            velocidade: {x: 0, y:0},
            isControlled: true
        });
        this.sprites = {
        idle: {
            imageSrc: '../../../images/Gangsters_1/Idle_2.png',
            framesMax: 11
        },
        run: {
            imageSrc: '../../../images/Gangsters_1/Run.png',
            framesMax: 10
        },
        attack: {
            imageSrc: '../../../images/Gangsters_1/Shot.png',
            framesMax: 4
        },
        jump: {
            imageSrc: '../../../images/Gangsters_1/Jump.png',
            framesMax: 10
        },
        dead: {
            imageSrc: '../../../images/Gangsters_1/Dead.png',
            framesMax: 5
        }
        };
        for (const estado in this.sprites) {
            const sprite = this.sprites[estado];
            sprite.image = new Image();
            sprite.image.src = sprite.imageSrc;
        }
        this.flip = false;
        this.vida = 100;
    }

    matar(){
        this.morto = true;
        this.switchSprite("dead");
        this.velocidade.x = 0;
        this.velocidade.y = 0;
    }

    switchSprite(estado) {
        const sprite = this.sprites[estado];
        if (!sprite || this.image === sprite.image) return;

        this.image = sprite.image;
        this.framesMax = sprite.framesMax;
        this.frameCurrent = 0;
    }

    update(secondsPassed, context) {
        if(this.morto) return;
        super.update(secondsPassed, context);
    }
}