import { principalCharacter } from "./entidades/fighters/principalCharacter.js";
import { Cenario } from "./entidades/cenario.js";
import { Vilao2 } from "./entidades/fighters/vilao2.js"; 
import { Movimentos } from "./constantes/movimento.js";

let canvas, context;
let previousTime = 0;
let jogoIniciado = false;
let entidades = [];
let player;
let vilao2;

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
  f: { pressed: false, pressionadoAgora: false },
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
    velocidade: {x: 0, y:0} 
  });

  vilao2 = new Vilao2({
    position: { x: canvas.width - 500, y: 450 },
    velocidade: {x: 0, y:0}
  });

  entidades = [ new Cenario(), player, vilao2 ];

  new Movimentos(player, keys);

  previousTime = performance.now();
  requestAnimationFrame(frame);
}

function colisao(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function frame(currentTime) {
  const secondsPassed = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (player.atacando){
    const attack = player.getAttackHitBox();
    const vilaoHitBox = vilao2.getHitBox();

    if(colisao(attack, vilaoHitBox)){
      vilao2.takeDamage(2);
      player.atacando = false
    };
  }

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

  console.log("F pressionado, Cooldown:", currentTime - lastShootTime > shootCooldownTime)

  if (keys.f.pressionadoAgora && currentTime - lastShootTime > shootCooldownTime) {
    player.velocidade.x = 0;
    player.atacar();
    player.switchSprite('attack');
    lastShootTime = currentTime;
    keys.f.pressionadoAgora = false;
    console.log("Tiro disparado!", currentTime)
  }

  setTimeout(() => {
    if(player.atacando){
      player.atacando = false;
    };
  }, 200);
  // Atualiza e desenha
  for (const entidade of entidades) {
    entidade.update(secondsPassed, context);
    entidade.draw(context);
  }

  for(const proj of player.projeteis){
    proj.update();
    proj.draw(context);

    const projHitBox = proj.getHitBox();
    const vilaoHitBox = vilao2.getHitBox();

    if(colisao(projHitBox, vilaoHitBox)){
      vilao2.takeDamage(proj.dano);

      player.projeteis = player.projeteis.filter(p => p !== proj);
    }
  }
  for (let i = player.projeteis.length - 1; i >= 0; i--) {
    const proj = player.projeteis[i]
    const projHitBox = proj.getHitBox()
    const vilaoHitBox = vilao2.getHitBox()

    if (colisao(projHitBox, vilaoHitBox)) {
      vilao2.takeDamage(proj.dano)
      player.projeteis.splice(i, 1)
    }
  }
  requestAnimationFrame(frame);
}