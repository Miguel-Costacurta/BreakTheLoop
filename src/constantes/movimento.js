export class Movimentos {
    constructor (player, keys){
        this.player = player;
        window.addEventListener('keydown', (event) =>{
        switch(event.key){
            case 'd':
                keys.d.pressed = true;
                break;
            case 'a':
                keys.a.pressed = true;
                break;
            case ' ':
                keys.space.pressed = true;
                if(this.player.noChao){
                    this.player.velocidade.y = -17;
                }
                break;
            case 'f':
                console.log("Tecla F pressionada", keys.f.pressed)
                if(!keys.f.pressed){
                    keys.f.pressionadoAgora = true;
                }
                keys.f.pressed = true
                break;
            case 'e':
                keys.e.pressed = true;
                break;
        }
    }); 
    window.addEventListener('keyup', (event) =>{
        switch(event.key){
            case 'd':
                keys.d.pressed = false;
                break;
            case 'a':
                keys.a.pressed = false;
                break;
            case ' ':
                keys.space.pressed = false;
                break;
            case 'f':
                keys.f.pressed = false;
                keys.f.pressionadoAgora = false;
                console.log("Tecla F solta");
                break;
            case 'e':
                keys.e.pressed = false;
                break;
        }
    });
    }
}