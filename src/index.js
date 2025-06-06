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

window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const startScreen = document.getElementById("start-screen");

  canvas = document.querySelector("canvas");
  context = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  setTimeout(() => {
    loadingScreen.style.display = "none";
    startScreen.style.display = "flex";
  }, 5000);

  window.addEventListener("keydown", iniciarJogo);
});

function iniciarJogo() {
  if (jogoIniciado) return;
  jogoIniciado = true;
  document.getElementById("start-screen").style.display = "none";
  window.removeEventListener("keydown", iniciarJogo);

  // Criação dos objetos
  player = new principalCharacter({
    position: { x: 200, y: 450 },
    velocidade: {x: 0, y:0} 
  });

  const vilao2 = new Vilao2({
    position: { x: canvas.width - 500, y: 450 },
    velocidade: {x: 0, y:0}
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
    player.velocidade.x = -3;
  } else if (keys.d.pressed) {
    player.switchSprite('run');
    player.flip = false;
    player.velocidade.x = 3;
  } else {
    player.velocidade.x = 0;
    player.switchSprite('idle');
  }

  if (keys.space.pressed) {
    player.switchSprite('jump');
    
  }

  if (keys.f.pressed) {
    player.velocidade.x = 0;
    player.switchSprite('attack');
  }

  // Atualiza e desenha
  for (const entidade of entidades) {
    entidade.update(secondsPassed, context);
    entidade.draw(context);
  }

  requestAnimationFrame(frame);
}
