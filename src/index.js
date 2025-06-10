import { principalCharacter } from "./entidades/fighters/principalCharacter.js"
import { Cenario } from "./entidades/Cenario.js"
import { Vilao2 } from "./entidades/fighters/vilao2.js"
import { Vilao3 } from "./entidades/fighters/vilao3.js"
import { Movimentos } from "./constantes/movimento.js"
import { Cenario2 } from "./entidades/Cenario2.js"

// Variáveis globais do jogo
let canvas, context
let previousTime = 0
let jogoIniciado = false
let entidades = []
let vilao2, vilao3, player;
let faseAtual = 1;
let transicaoEmAndamento = false;

// Carrega o som do tiro
const shotSound = new Audio('assets/shot.mp3');
shotSound.volume = 0.2;

// Ativa o som ao pressionar F
document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === "f") {
        console.log("Som do tiro tocando");
        
        // Aqui você pode também disparar o projétil, se quiser
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const musicaFundo = document.getElementById("musicaFundo");
  musicaFundo.volume = 0.2;

  let musicaTocando = false;

  document.addEventListener("keydown", () => {
    if (!musicaTocando) {
      musicaFundo.play()
        .then(() => {
          musicaTocando = true;
        })
        .catch((err) => {
          console.error("Erro ao tentar tocar a música:", err);
        });
    }
  });
});

// Sistema de controles do jogador
const keys = {
  a: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
  f: { pressed: false, pressionadoAgora: false },
  e: { pressed: false },
}

// Sistema de cooldown para tiros do jogador
let lastShootTime = 0
const shootCooldownTime = 300

// Inicialização do jogo quando a página carrega
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen")
  const startScreen = document.getElementById("start-screen")

  canvas = document.querySelector("canvas")
  context = canvas.getContext("2d")

  // Define tamanho do canvas para tela cheia
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Simula carregamento por 5 segundos
  setTimeout(() => {
    loadingScreen.style.display = "none"
    startScreen.style.display = "flex"
  }, 5000)

  window.addEventListener("keydown", iniciarJogo)
})

function iniciarJogo() {
  if (jogoIniciado) return
  jogoIniciado = true
  document.getElementById("start-screen").style.display = "none"
  window.removeEventListener("keydown", iniciarJogo)

  // ========================================
  // CRIAÇÃO DOS PERSONAGENS
  // ========================================

  // Cria o jogador principal
  player = new principalCharacter({
    position: { x: 200, y: 450 },
    velocidade: { x: 0, y: 0 },
  })

  // Cria o vilão corpo a corpo
  vilao2 = new Vilao2({
    position: { x: canvas.width - 500, y: 450 }, // Posiciona no lado direito
    velocidade: { x: 0, y: 0 },
  })

  vilao3 = new Vilao3({
    position: { x: canvas.width - 500, y: 450 }, // Posiciona no lado direito
    velocidade: { x: 0, y: 0 },
  })
  
  // ========================================
  // CONFIGURAÇÃO DA IA
  // ========================================

  // CRÍTICO: Define o jogador como target do vilão
  // Sem isso, a IA não funciona!
  vilao2.setTarget(player)

  // Array com todas as entidades do jogo
  entidades = [new Cenario(), player, vilao2]

  // Inicializa sistema de controles
  new Movimentos(player, keys)

  // Inicia o loop principal do jogo
  previousTime = performance.now()
  requestAnimationFrame(frame)
}

/**
 * Função de detecção de colisão entre retângulos
 * @param {Object} rect1 - Primeiro retângulo
 * @param {Object} rect2 - Segundo retângulo
 * @returns {boolean} True se há colisão
 */
function colisao(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}

/**
 * Loop principal do jogo - executa ~60 vezes por segundo
 * @param {number} currentTime - Timestamp atual
 */
function frame(currentTime) {
  // Calcula tempo decorrido desde o último frame
  const secondsPassed = (currentTime - previousTime) / 1000
  previousTime = currentTime

  // Limpa a tela para o próximo frame
  context.clearRect(0, 0, canvas.width, canvas.height)

  // ========================================
  // SISTEMA DE COMBATE CORPO A CORPO
  // ========================================

  // Verifica ataque corpo a corpo do JOGADOR contra VILÃO
  if (player.atacando) {
    const attack = player.getAttackHitBox()
    const vilaoHitBox = vilao2.getHitBox()

    if (colisao(attack, vilaoHitBox)) {
      vilao2.takeDamage(2) // Jogador causa 2 de dano
      player.atacando = false // Para o ataque
    }
  }

  // Verifica ataque corpo a corpo do VILÃO contra JOGADOR
  // Vilão agora só ataca corpo a corpo, sem projéteis
  if (vilao2.atacando) {
    const vilaoAttack = vilao2.getAttackHitBox()
    const playerHitBox = player.getHitBox()

    if (colisao(vilaoAttack, playerHitBox)) {
      player.takeDamage(5) // Vilão corpo a corpo causa mais dano (5)
      vilao2.atacando = false // Para o ataque

      // Efeito visual de impacto (opcional)
      console.log("Vilão acertou um soco no jogador!")
    }
  }

  // ========================================
  // NOVO: SISTEMA DE ATAQUE ESPECIAL DO VILÃO
  // ========================================

  // Verifica ATAQUE ESPECIAL do VILÃO contra JOGADOR
  if (vilao2.atacandoEspecial) {
    const especialAttack = vilao2.getSpecialAttackHitBox()
    const playerHitBox = player.getHitBox()

    if (colisao(especialAttack, playerHitBox)) {
      player.takeDamage(8) // ATAQUE ESPECIAL causa 8 de dano (MUITO MAIS!)
      vilao2.atacandoEspecial = false

      // Efeitos visuais/sonoros do ataque especial
      console.log("💥 VILÃO ACERTOU ATAQUE ESPECIAL! DANO CRÍTICO!")
    }
  }

  // ========================================
  // CONTROLES DO JOGADOR
  // ========================================
  if(!player.morto){
    // Movimento horizontal
  if (keys.a.pressed) {
    player.switchSprite("run")
    player.flip = true
    player.velocidade.x = -4
  } else if (keys.d.pressed) {
    player.switchSprite("run")
    player.flip = false
    player.velocidade.x = 4
  } else {
    player.velocidade.x = 0
    player.switchSprite("idle")
  }

  // Pulo
  if (keys.space.pressed) {
    player.switchSprite("jump")
  }

  // Sistema de tiro do jogador (mantido)
  if (keys.f.pressionadoAgora && currentTime - lastShootTime > shootCooldownTime) {
    player.velocidade.x = 0 // Para durante o tiro
    player.atacar() // Cria projétil
    player.switchSprite("attack")
    lastShootTime = currentTime
    keys.f.pressionadoAgora = false
  }

  // Remove estado de ataque após 200ms
  setTimeout(() => {
    if (player.atacando) {
      player.atacando = false
    }
  }, 200)
  }

  // ========================================
  // ATUALIZAÇÃO DE TODAS AS ENTIDADES
  // ========================================

  // Atualiza e desenha cenário, jogador e vilão
  // O vilão executa sua IA automaticamente no método update()
  for (const entidade of entidades) {
    entidade.update(secondsPassed, context) // Física, IA, animações
    entidade.draw(context) // Desenha na tela
  }

  // ========================================
  // SISTEMA DE PROJÉTEIS DO JOGADOR (MANTIDO)
  // ========================================

  // Atualiza projéteis do jogador
  for (const proj of player.projeteis) {
    proj.update() // Move o projétil
    proj.draw(context) // Desenha o projétil

    // Verifica colisão projétil vs vilão
    const projHitBox = proj.getHitBox()
    const vilaoHitBox = vilao2.getHitBox()

    if (colisao(projHitBox, vilaoHitBox)) {
      vilao2.takeDamage(proj.dano) // Aplica dano
      // Remove projétil que acertou
      player.projeteis = player.projeteis.filter((p) => p !== proj)
    }
  }
  // ========================================
  // LIMPEZA DE PROJÉTEIS DO JOGADOR
  // ========================================

  // Remove projéteis que saíram da tela (otimização)
  player.projeteis = player.projeteis.filter((proj) => proj.position.x > -50 && proj.position.x < canvas.width + 50)

  // ========================================
  // DEBUG (OPCIONAL)
  // ========================================

  // Descomente para ver informações da IA em tempo real
  // console.log("Estado do Vilão:", vilao2.getEstadoAtual());

  // Continua o loop do jogo
  
  if (faseAtual === 1 && vilao2.morto && !transicaoEmAndamento) {
    transicaoEmAndamento = true
    iniciarTransicaoParaFase2()
  }
  requestAnimationFrame(frame)
}

function mostrarTelaPreta(callbackDepois) {
  const tela = document.getElementById("fase-transicao")
  tela.style.opacity = "1000"

  setTimeout(() => {
    callbackDepois()
    tela.style.opacity = "0"
  }, 3000)
}

function iniciarTransicaoParaFase2() {
  mostrarTelaPreta(() => {
    console.log("Transição para fase 2 iniciada...")

    const novoCenario = new Cenario2()

    const vilao3 = new Vilao3({
      position: { x: canvas.width - 500, y: 450 },
      velocidade: { x: 0, y: 0 },
    })
    vilao3.setTarget(player)

    entidades = [novoCenario, player, vilao3]

    faseAtual = 2
    transicaoEmAndamento = false
  })
}