import { lutadores } from "./Lutadores.js";

export class Lingui extends lutadores {
    constructor(x,y,velocidade){
        super('Lingui',x,y,velocidade);

        this.image = document.querySelector('img[alt="lingui"]');
    }
}