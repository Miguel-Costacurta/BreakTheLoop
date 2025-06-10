import { lutadores } from "./Lutadores.js"

export class Vilao2 extends lutadores {
  constructor({ position, velocidade }) {
    // Chama o construtor da classe pai (lutadores) com as configurações básicas
    super({
      nome: "Vilao2",
      position,
      imageSrc: "../../../images/Homeless_1/Idle_2.png", // Sprite inicial atualizada
      scale: 3,
      framesMax: 11, // Frames da nova sprite de idle
      offset: { x: 0, y: 0 },
      velocidade,
    })

    // ========================================
    // SISTEMA DE SPRITES - Incluindo Ataque Especial
    // ========================================
    this.sprites = {
      idle: {
        imageSrc: "../../../images/Homeless_1/Idle_2.png",
        framesMax: 11, // Sprite de idle com 11 frames
        loop:true,
      },
      run: {
        imageSrc: "../../../images/Homeless_1/Run.png",
        framesMax: 8, // Sprite de corrida com 8 frames
        loop:true,
      },
      attack: {
        imageSrc: "../../../images/Homeless_1/Attack_2.png", // Ataque normal
        framesMax: 3, // Ajuste conforme sua sprite de ataque normal
        loop:false,
      },
      special: {
        imageSrc: "../../../images/Homeless_1/Special.png", // ATAQUE ESPECIAL
        framesMax: 13, // Sprite de ataque especial com 13 frames
        loop:false,
      },
      jump: {
        imageSrc: "../../../images/Homeless_1/Jump.png",
        framesMax: 16, // Sprite de pulo com 16 frames
        loop:false,
      },
      hit:{
        imageSrc:"../../../images/Homeless_1/Hurt.png",
        framesMax: 3,
        loop:false,
      },
      death:{
        imageSrc:"../../../images/Homeless_1/Dead.png",
        framesMax: 4,
        loop:false,
      }
    }

    // Pré-carrega todas as imagens das sprites para evitar lag durante o jogo
    for (const estado in this.sprites) {
      const sprite = this.sprites[estado]
      sprite.image = new Image()
      sprite.image.src = sprite.imageSrc
    }

    // ========================================
    // SISTEMA DE IA - Configurações para Lutador com Ataque Especial
    // ========================================

    // Estado atual da máquina de estados do vilão
    this.estado = "idle" // Começa parado

    // Referência ao jogador que será perseguido
    this.target = null

    // Distâncias ajustadas para combate corpo a corpo
    this.distanciaAtaque = 60 // Distância para ataque normal
    this.distanciaAtaqueEspecial = 120 // Distância maior para ataque especial
    this.distanciaPerseguicao = 1250 // Distância para começar a perseguir
    this.distanciaRecuo = 50 // Distância muito próxima que faz o vilão recuar

    // Sistema de timing para controlar ações
    this.tempoUltimaAcao = 0 // Quando foi o último ataque
    this.tempoUltimoEspecial = 0 // Quando foi o último ataque especial
    this.cooldownAtaque = 1500 // Tempo entre ataques normais (1.5 segundos)
    this.cooldownEspecial = 4000 // Tempo entre ataques especiais (4 segundos)
    this.velocidadeMovimento = 2 // Velocidade base (mais lento q o principal)
    this.tempoNoEstado = 0.8 // Quanto tempo está no estado atual
    this.duracaoAtaque = 700 // Duração da animação de ataque normal
    this.duracaoEspecial = 2800 // Duração da animação de ataque especial (mais longa)

    // ========================================
    // SISTEMA DE ALEATORIEDADE - Incluindo Ataque Especial
    // ========================================
    this.chanceAtaqueNormal = 0.6 // 50% chance de ataque normal
    this.chanceAtaqueEspecial = 0.05 // 15% chance de ataque especial
    this.chanceRecuo = 0.15 // 15% chance de recuar
    this.tempoReacaoMin = 500 // Tempo mínimo de reação
    this.tempoReacaoMax = 1000 // Tempo máximo de reação

    // ========================================
    // SISTEMA DE ATAQUE ESPECIAL
    // ========================================
    this.carregandoEspecial = false // Se está preparando ataque especial
    this.tempoCarregamento = 300 // Tempo de preparação do especial (0.5s)
    this.raioEspecial = 150 // Alcance maior do ataque especial
    this.danoEspecial = 8 // Dano maior do ataque especial
    this.ultimoEspecialUsado = 0 // Controle de quando foi usado

    // Vilão começa virado para a esquerda
    this.flip = true

    // ========================================
    // NOVO: CONFIGURAÇÕES DE HITBOX DE ATAQUE
    // ========================================

    // Sobrescreve as configurações de hitbox de ataque da classe pai
    this.attackHitbox = {
      offset: { x: 60, y: 200 }, // Posição ajustada para o vilão (Y mais alto para ficar na altura correta)
      width: 100,
      height: 80,
    }
  }

  // ========================================
  // SISTEMA DE ANIMAÇÃO
  // ========================================

  /**
   * Troca a sprite atual do vilão baseada no estado
   * @param {string} estado - Nome do estado (idle, run, attack, special, jump)
   */
  switchSprite(estado) {
    const sprite = this.sprites[estado]
    if (!sprite || this.image === sprite.image) return

    this.image = sprite.image
    this.framesMax = sprite.framesMax
    this.frameCurrent = 0
    this.currentSprite = estado

    // Define se deve repetir ou não a animação
    this.loop = estado !== "death" && estado !== "dead"
    this.isAnimationDone = false
  }
  // ========================================
  // SISTEMA DE DETECÇÃO - Incluindo Especial
  // ========================================

  /**
   * Calcula a distância euclidiana até o target
   */
  calcularDistancia(target) {
    if (!target) return Number.POSITIVE_INFINITY
    const dx = target.position.x - this.position.x
    const dy = target.position.y - this.position.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Verifica se o vilão pode atacar normalmente
   */
  podeAtacar(currentTime) {
    return currentTime - this.tempoUltimaAcao > this.cooldownAtaque
  }

  /**
   * Verifica se o vilão pode usar ataque especial
   */
  podeUsarEspecial(currentTime) {
    return currentTime - this.tempoUltimoEspecial > this.cooldownEspecial
  }

  /**
   * Verifica se o target está à esquerda do vilão
   */
  targetEstaEsquerda(target) {
    return target.position.x < this.position.x
  }

  /**
   * Verifica se o target está na altura ideal para ataque
   */
  targetNaAlturaCorreta(target) {
    const diferencaAltura = Math.abs(target.position.y - this.position.y)
    return diferencaAltura < 50
  }

  /**
   * Verifica condições ideais para ataque especial
   */
  condicoesParaEspecial(target, currentTime) {
    const distancia = this.calcularDistancia(target)
    return (
      distancia < this.distanciaAtaqueEspecial &&
      this.podeUsarEspecial(currentTime) &&
      this.targetNaAlturaCorreta(target) &&
      target.health > 30 // Só usa especial se jogador tiver vida suficiente
    )
  }

  // ========================================
  // MÁQUINA DE ESTADOS - Incluindo Estado Especial
  // ========================================

  /**
   * Atualiza o estado atual do vilão
   * Agora inclui lógica para ataque especial
   */
  atualizarEstado(target, currentTime) {
    if (!target) return

    const distancia = this.calcularDistancia(target)
    this.tempoNoEstado += 16 // ~60fps

    // Gera número aleatório para decisões
    const acaoAleatoria = Math.random()

    switch (this.estado) {
      // ESTADO IDLE: Vilão parado, observando
      case "idle":
        this.switchSprite("idle")
        this.emCombo = false
        this.contadorCombo = 0

        if (distancia < this.distanciaPerseguicao) {
          if (this.tempoNoEstado > this.getTempoReacaoAleatorio()) {
            this.estado = "perseguindo"
            this.tempoNoEstado = 0
          }
        }
        break

      // ESTADO PERSEGUINDO: Vilão seguindo o jogador
      case "perseguindo":
        this.switchSprite("run")

        // PRIORIDADE 1: Ataque Normal (AGORA EM PRIMEIRO)
        if (distancia < this.distanciaAtaque && this.podeAtacar(currentTime)) {
          if (acaoAleatoria < this.chanceAtaqueNormal) {
            this.estado = "atacando"
            this.tempoNoEstado = 0
          }
        }
        // PRIORIDADE 2: Ataque Especial (AGORA EM SEGUNDO)
        else if (this.condicoesParaEspecial(target, currentTime) && acaoAleatoria < this.chanceAtaqueEspecial) {
          this.estado = "especial"
          this.tempoNoEstado = 0
          this.carregandoEspecial = true
          console.log("🔥 Vilão vai usar ATAQUE ESPECIAL!")
        }
        // PRIORIDADE 3: Recuar se muito próximo (MANTIDO EM TERCEIRO)
        else if (distancia < this.distanciaRecuo && acaoAleatoria < this.chanceRecuo) {
          this.estado = "recuando"
          this.tempoNoEstado = 0
        }
        break

      // ESTADO ATACANDO: Ataque normal
      case "atacando":
        this.switchSprite("attack")

        if (this.tempoNoEstado > this.duracaoAtaque) {
          // Verifica combo
          if (
            this.contadorCombo < this.maxCombo &&
            distancia < this.distanciaAtaque * 1.2 &&
            acaoAleatoria < this.chanceComboAtaque
          ) {
            this.emCombo = true
            this.contadorCombo++
            this.tempoNoEstado = 0
            this.tempoUltimaAcao = currentTime - this.cooldownAtaque + 300
          } else {
            this.emCombo = false
            this.contadorCombo = 0
            if (acaoAleatoria < 0.2) {
              this.estado = "recuando"
            } else {
              this.estado = "perseguindo"
            }
            this.tempoNoEstado = 0
          }
        }
        break

      // NOVO ESTADO: ATAQUE ESPECIAL
      case "especial":
        this.switchSprite("special") // Usa a sprite especial

        // Fase 1: Carregamento (preparação)
        if (this.carregandoEspecial && this.tempoNoEstado < this.tempoCarregamento) {
          // Vilão para e se prepara
          this.velocidade.x = 0
          // Efeito visual de preparação (opcional)
          if (this.tempoNoEstado % 100 < 50) {
            // Pisca a cada 100ms durante preparação
            console.log("⚡ Carregando ataque especial...")
          }
        }
        // Fase 2: Execução do ataque especial
        else if (this.tempoNoEstado >= this.tempoCarregamento && this.tempoNoEstado < this.duracaoEspecial) {
          if (this.carregandoEspecial) {
            // Executa o ataque especial uma vez
            this.executarAtaqueEspecial(currentTime)
            this.carregandoEspecial = false
          }
        }
        // Fase 3: Finalização
        else if (this.tempoNoEstado >= this.duracaoEspecial) {
          // Termina o ataque especial
          this.carregandoEspecial = false
          // Decide próximo estado
          if (acaoAleatoria < 0.6) {
            this.estado = "recuando" // 60% chance de recuar após especial
          } else {
            this.estado = "perseguindo" // 40% chance de continuar
          }
          this.tempoNoEstado = 0
        }
        break

      // ESTADO RECUANDO: Vilão se afastando
      case "recuando":
        this.switchSprite("run")
        this.emCombo = false
        this.contadorCombo = 0

        if (this.tempoNoEstado > 800) {
          if (distancia > this.distanciaAtaque * 1.5) {
            this.estado = "perseguindo"
          } else {
            this.estado = "idle"
          }
          this.tempoNoEstado = 0
        }
        break
    }
  }

  /**
   * Executa o ataque especial
   */
  executarAtaqueEspecial(currentTime) {
    console.log("💥 ATAQUE ESPECIAL EXECUTADO!")
    this.atacandoEspecial = true // Flag para detecção de colisão especial
    this.tempoUltimoEspecial = currentTime

    // Para o ataque especial após um tempo
    setTimeout(() => {
      this.atacandoEspecial = false
    }, 400) // Ataque especial ativo por 400ms
  }

  /**
   * Gera tempo de reação aleatório
   */
  getTempoReacaoAleatorio() {
    return this.tempoReacaoMin + Math.random() * (this.tempoReacaoMax - this.tempoReacaoMin)
  }

  // ========================================
  // SISTEMA DE COMPORTAMENTOS - Incluindo Especial
  // ========================================

  /**
   * Executa o comportamento correspondente ao estado atual
   */
  executarComportamento(target, currentTime) {
    if (!target) return

    switch (this.estado) {
      case "idle":
        this.velocidade.x = 0
        if (Math.random() < 0.02) {
          this.flip = this.targetEstaEsquerda(target)
        }
        break

      case "perseguindo":
        this.perseguirTarget(target)
        break

      case "atacando":
        this.atacarCorpoACorpo(target, currentTime)
        break

      case "especial":
        this.comportamentoEspecial(target, currentTime)
        break

      case "recuando":
        this.recuarDoTarget(target)
        break
    }
  }

  /**
   * Comportamento durante ataque especial
   */
  comportamentoEspecial(target, currentTime) {
    // Para completamente durante o especial
    this.velocidade.x = 0

    // Sempre vira para o target
    this.flip = this.targetEstaEsquerda(target)

    // Durante a preparação, pode se mover ligeiramente em direção ao target
    if (this.carregandoEspecial && this.tempoNoEstado < this.tempoCarregamento) {
      const distancia = this.calcularDistancia(target)
      if (distancia > this.distanciaAtaqueEspecial * 0.8) {
        // Move lentamente em direção ao target durante preparação
        const velocidadeLenta = 0.5
        if (target.position.x > this.position.x) {
          this.velocidade.x = velocidadeLenta
        } else {
          this.velocidade.x = -velocidadeLenta
        }
      }
    }
  }

  /**
   * Comportamento de perseguição (mantido igual)
   */
  perseguirTarget(target) {
    const distancia = this.calcularDistancia(target)

    let velocidadeMultiplicador = 1
    if (distancia > 200) {
      velocidadeMultiplicador = 1.3
    } else if (distancia < 100) {
      velocidadeMultiplicador = 0.7
    }

    const velocidadeVariacao = 0.8 + Math.random() * 0.4

    if (target.position.x > this.position.x) {
      this.velocidade.x = this.velocidadeMovimento * velocidadeMultiplicador * velocidadeVariacao
      this.flip = false
    } else {
      this.velocidade.x = -this.velocidadeMovimento * velocidadeMultiplicador * velocidadeVariacao
      this.flip = true
    }

    if (!target.noChao && this.noChao && Math.random() < 0.03) {
      this.velocidade.y = -16
    }

    if (this.noChao && Math.random() < 0.01) {
      this.velocidade.y = -12
    }
  }

  /**
   * Comportamento de ataque normal (mantido igual)
   */
  atacarCorpoACorpo(target, currentTime) {
    this.velocidade.x = 0
    this.flip = this.targetEstaEsquerda(target)

    if (this.podeAtacar(currentTime)) {
      this.atacando = true
      this.tempoUltimaAcao = currentTime

      setTimeout(() => {
        this.atacando = false
      }, this.duracaoAtaque)
    }
  }

  matar() {
  this.morto = true
  this.switchSprite("death") // Se você tiver uma animação de morte
  this.velocidade.x = 0
  this.velocidade.y = 0
}
  /**
   * Comportamento de recuo (mantido igual)
   */
  recuarDoTarget(target) {
    const velocidadeRecuo = this.velocidadeMovimento * 1.8

    if (target.position.x > this.position.x) {
      this.velocidade.x = -velocidadeRecuo
      this.flip = true
    } else {
      this.velocidade.x = velocidadeRecuo
      this.flip = false
    }
  }

  /**
   * CORRIGIDO: Hitbox de ataque normal
   * Sobrescreve o método da classe pai para usar as configurações específicas do vilão
   */
  getAttackHitBox() {
    // Calcula a posição baseada na direção que o personagem está olhando
    const attackX = this.flip
      ? this.position.x + this.attackHitbox.offset.x - this.attackHitbox.width - 20 // Ataque à esquerda
      : this.position.x + this.attackHitbox.offset.x + 20 // Ataque à direita

    return {
      x: attackX,
      y: this.position.y + this.attackHitbox.offset.y, // Altura correta do torso
      width: this.attackHitbox.width,
      height: this.attackHitbox.height,
    }
  }

  /**
   * CORRIGIDO: Hitbox especial para ataque especial (maior alcance)
   */
  getSpecialAttackHitBox() {
    // Usa a mesma altura base do ataque normal, mas com maior alcance
    const specialAttackX = this.flip
      ? this.position.x + this.attackHitbox.offset.x - this.attackHitbox.width - 60 // Maior alcance à esquerda
      : this.position.x + this.attackHitbox.offset.x + 60 // Maior alcance à direita

    return {
      x: specialAttackX,
      y: this.position.y + this.attackHitbox.offset.y - 20, // Ligeiramente mais alto
      width: this.attackHitbox.width + 60, // Mais largo
      height: this.attackHitbox.height + 40, // Mais alto
    }
  }

  // ========================================
  // SOBRESCRITA DE MÉTODOS
  // ========================================

  /**
   * Sobrescreve o método atacar para remover projéteis
   */
  atacar() {
    if (!this.atacando) {
      this.atacando = true
      this.tempoAtaque = 0
    }
  }

  /**
   * Update com IA
   */
  update(secondsPassed, context) {
  if(this.morto){
    this.switchSprite('death');  // animação de morte
    super.update(secondsPassed, context);  // atualiza animação
    return;  // não processa IA ou movimento
  }

  if (this.target) {
    const currentTime = performance.now()
    this.atualizarEstado(this.target, currentTime)
    this.executarComportamento(this.target, currentTime)
  }

  super.update(secondsPassed, context)
}

  /**
   * Define o target
   */
  setTarget(target) {
    this.target = target
  }

  /**
   * Debug com informações do especial
   */
  getEstadoAtual() {
    return {
      estado: this.estado,
      distancia: this.target ? this.calcularDistancia(this.target).toFixed(2) : "N/A",
      tempoNoEstado: this.tempoNoEstado,
      podeAtacar: this.target ? this.podeAtacar(performance.now()) : false,
      podeEspecial: this.target ? this.podeUsarEspecial(performance.now()) : false,
      carregandoEspecial: this.carregandoEspecial,
      atacandoEspecial: this.atacandoEspecial || false,
      emCombo: this.emCombo,
      contadorCombo: this.contadorCombo,
    }
  }

  /**
   * NOVO: Método para desenhar hitboxes de debug
   * Sobrescreve o método draw da classe pai para adicionar visualização dos hitboxes
   */
  draw(context) {
    // Chama o método draw da classe pai primeiro
    super.draw(context);
    // Resetar configurações do contexto
    context.lineWidth = 1
  }
}
