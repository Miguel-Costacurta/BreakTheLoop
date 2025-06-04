import { principalCharacter } from "./entidades/fighters/principalCharacter.js";
import { Sprite } from "./entidades/Sprite.js";
import { Cenario } from "./entidades/cenario.js";

const janelaDoJogo = {
    WIDTH: 1536,
    HEIGHT: 1024,
};

window.addEventListener('load', function() {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');

    canvas.width = janelaDoJogo.WIDTH;
    canvas.height = janelaDoJogo.HEIGHT;

    const player = new principalCharacter({
        position: { x: 100, y: 300 }
    });

    const entidades = [
        new Cenario(),
        player
    ];

    let previousTime = 0;

    function frame(currentTime) {
        window.requestAnimationFrame(frame);

        const secondsPassed = (currentTime - previousTime) / 1000;
        previousTime = currentTime;

        context.clearRect(0, 0, canvas.width, canvas.height);

        for (const entidade of entidades) {
            entidade.update(secondsPassed, context);
        }

        for (const entidade of entidades) {
            entidade.draw(context);
        }
    }

    window.requestAnimationFrame(frame);
});