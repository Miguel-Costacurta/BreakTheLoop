import { principalCharacter } from "./entidades/fighters/principalCharacter.js";
import { Cenario } from "./entidades/cenario.js";
import { Vilao2 } from "./entidades/fighters/vilao2.js"; 
import { Movimentos } from "./constantes/movimento.js";

let canvas, context;
let previousTime = 0;
let jogoIniciado = false;
let entidades = [];
let player;

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
  f: { pressed: false },
  e: { pressed: false }
};

function iniciarJogo() {
  if (jogoIniciado) return;
  jogoIniciado = true;
  document.getElementById("start-screen").style.display = "none";
  window.removeEventListener("keydown", iniciarJogo);

  // Criação dos objetos
  player = new principalCharacter({
    position: { x: 200, y: 450 },
    velocidade: 0
  });

  const vilao2 = new Vilao2({
    position: { x: canvas.width - 500, y: 450 },
    velocidade: 0
  });

  entidades = [ new Cenario(), player, vilao2 ];

  new Movimentos(player, keys);

  previousTime = performance.now();
  requestAnimationFrame(frame);
}

function frame(currentTime) {
  const secondsPassed = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Controle de movimento e animações
  if (keys.a.pressed) {
    player.switchSprite('run');
    player.flip = true;
    player.velocidade = -200;
  } else if (keys.d.pressed) {
    player.switchSprite('run');
    player.flip = false;
    player.velocidade = 200;
  } else {
    player.velocidade = 0;
    player.switchSprite('idle');
  }

  if (keys.space.pressed) {
    player.switchSprite('jump');
    // lógica de pulo (deve estar no update ou Movimentos)
  }

  if (keys.f.pressed) {
    player.switchSprite('attack');
  }

  // Atualiza e desenha
  for (const entidade of entidades) {
    entidade.update(secondsPassed, context);
    entidade.draw(context);
  }

  requestAnimationFrame(frame);
}
