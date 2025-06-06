export class Movimentos {
    constructor (player, keys){
        this.player;
        window.addEventListener('keydown', (event) =>{
        switch(event.key){
            case 'd':
                keys.d.pressed = true;
                break;
            case 'a':
                keys.a.pressed = true;
                break;
            case 'space':
                keys.space.pressed = true;
                break;
            case 'f':
                keys.f.pressed = true;
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
            case 'space':
                keys.space.pressed = false;
                break;
            case 'f':
                keys.f.pressed = false;
                break;
            case 'e':
                keys.e.pressed = false;
                break;
        }
    });
    }
}