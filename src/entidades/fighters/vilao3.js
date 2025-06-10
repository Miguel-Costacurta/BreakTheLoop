import { lutadores } from "./Lutadores.js"

export class Vilao3 extends lutadores {
  constructor({ position, velocidade }) {
    super({
      nome: "Vilao3",
      position,
      imageSrc: "../../../images/Gangsters_3/Idle_2.png",
      scale: 3,
      framesMax: 14,
      offset: { x: 0, y: 0 },
      velocidade,
    })

    this.sprites = {
      idle: {
        imageSrc: "../../../images/Gangsters_3/Idle_2.png",
        framesMax: 14,
      },
      run: {
        imageSrc: "../../../images/Gangsters_3/Run.png",
        framesMax: 10,
      },
      attack: {
        imageSrc: "../../../images/Gangsters_3/Attack.png",
        framesMax: 5,
      },
      special: {
        imageSrc: "../../../images/Gangsters_3/Shot.png",
        framesMax: 12,
      },
      jump: {
        imageSrc: "../../../images/Gangsters_3/Jump.png",
        framesMax: 10,
      },
      death: {
        imageSrc: "../../../images/Gangsters_3/Dead.png", // Adicionando sprite de morte
        framesMax: 5, // Ajuste conforme sua sprite
      },
    }

    for (const estado in this.sprites) {
      const sprite = this.sprites[estado]
      sprite.image = new Image()
      sprite.image.src = sprite.imageSrc
    }

    this.estado = "idle"
    this.target = null
    this.distanciaAtaque = 80
    this.distanciaAtaqueEspecial = 120
    this.distanciaPerseguicao = 1250
    this.distanciaRecuo = 50
    this.tempoUltimaAcao = 0
    this.tempoUltimoEspecial = 0
    this.cooldownAtaque = 1200
    this.cooldownEspecial = 4000
    this.velocidadeMovimento = 3.5
    this.tempoNoEstado = 0
    this.duracaoAtaque = 600
    this.duracaoEspecial = 2700
    this.chanceAtaqueNormal = 0.5
    this.chanceAtaqueEspecial = 0.15
    this.chanceRecuo = 0.05
    this.tempoReacaoMin = 300
    this.tempoReacaoMax = 1000
    this.carregandoEspecial = false
    this.tempoCarregamento = 300
    this.raioEspecial = 150
    this.danoEspecial = 8
    this.ultimoEspecialUsado = 0
    this.flip = true
    this.deathAnimationComplete = false
    this.shouldDisappear = false

    // Configurações de hitbox
    this.attackHitbox = {
      offset: { x: 60, y: 200 },
      width: 100,
      height: 80,
    }
  }

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

  matar() {
    if (!this.morto) {
      console.log(`${this.nome} morreu!`)
      this.morto = true
      this.switchSprite("death")
      this.velocidade.x = 0
      this.velocidade.y = 0
    }
  }

  calcularDistancia(target) {
    if (!target) return Number.POSITIVE_INFINITY
    const dx = target.position.x - this.position.x
    const dy = target.position.y - this.position.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  podeAtacar(currentTime) {
    return currentTime - this.tempoUltimaAcao > this.cooldownAtaque
  }

  podeUsarEspecial(currentTime) {
    return currentTime - this.tempoUltimoEspecial > this.cooldownEspecial
  }


  targetEstaEsquerda(target) {
    return target.position.x < this.position.x
  }


  targetNaAlturaCorreta(target) {
    const diferencaAltura = Math.abs(target.position.y - this.position.y)
    return diferencaAltura < 50
  }

  condicoesParaEspecial(target, currentTime) {
    const distancia = this.calcularDistancia(target)
    return (
      distancia < this.distanciaAtaqueEspecial &&
      this.podeUsarEspecial(currentTime) &&
      this.targetNaAlturaCorreta(target) &&

      target.health > 30
    )
  }

  atualizarEstado(target, currentTime) {
    if (!target) return

    const distancia = this.calcularDistancia(target)

    this.tempoNoEstado += 16

    const acaoAleatoria = Math.random()

    switch (this.estado) {
      case "idle":
        this.switchSprite("idle")


        if (distancia < this.distanciaPerseguicao) {
          if (this.tempoNoEstado > this.getTempoReacaoAleatorio()) {
            this.estado = "perseguindo"
            this.tempoNoEstado = 0
          }
        }
        break

      case "perseguindo":
        this.switchSprite("run")

        if (distancia < this.distanciaAtaque && this.podeAtacar(currentTime)) {
          if (acaoAleatoria < this.chanceAtaqueNormal) {
            this.estado = "atacando"
            this.tempoNoEstado = 0
          }
        } else if (this.condicoesParaEspecial(target, currentTime) && acaoAleatoria < this.chanceAtaqueEspecial) {
          this.estado = "especial"
          this.tempoNoEstado = 0
          this.carregandoEspecial = true
          console.log("🔥 Vilão 3 vai usar ATAQUE ESPECIAL!")
        } else if (distancia < this.distanciaRecuo && acaoAleatoria < this.chanceRecuo) {

          this.estado = "recuando"
          this.tempoNoEstado = 0
        }
        break

      case "atacando":
        this.switchSprite("attack")

        if (this.tempoNoEstado > this.duracaoAtaque) {

          this.estado = "perseguindo"
          this.tempoNoEstado = 0
        }
        break

      case "especial":
        this.switchSprite("special")

        if (this.carregandoEspecial && this.tempoNoEstado < this.tempoCarregamento) {
          this.velocidade.x = 0
        } else if (this.tempoNoEstado >= this.tempoCarregamento && this.tempoNoEstado < this.duracaoEspecial) {
          if (this.carregandoEspecial) {
            this.executarAtaqueEspecial(currentTime)
            this.carregandoEspecial = false
          }
        } else if (this.tempoNoEstado >= this.duracaoEspecial) {
          this.carregandoEspecial = false
          if (acaoAleatoria < 0.6) {
            this.estado = "recuando"
          } else {
            this.estado = "perseguindo"

          }
          this.tempoNoEstado = 0
        }
        break

      case "recuando":
        this.switchSprite("run")

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

  executarAtaqueEspecial(currentTime) {
    console.log("💥 VILÃO 3 - ATAQUE ESPECIAL EXECUTADO!")
    this.atacandoEspecial = true
    this.tempoUltimoEspecial = currentTime

    setTimeout(() => {
      this.atacandoEspecial = false
    }, 400)
  }

  getTempoReacaoAleatorio() {
    return this.tempoReacaoMin + Math.random() * (this.tempoReacaoMax - this.tempoReacaoMin)
  }

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

  comportamentoEspecial(target, currentTime) {
    this.velocidade.x = 0
    this.flip = this.targetEstaEsquerda(target)

    if (this.carregandoEspecial && this.tempoNoEstado < this.tempoCarregamento) {
      const distancia = this.calcularDistancia(target)
      if (distancia > this.distanciaAtaqueEspecial * 0.8) {

        const velocidadeLenta = 0.5
        if (target.position.x > this.position.x) {
          this.velocidade.x = velocidadeLenta
        } else {
          this.velocidade.x = -velocidadeLenta
        }
      }
    }
  }
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


  getAttackHitBox() {
    const attackX = this.flip
      ? this.position.x + this.attackHitbox.offset.x - this.attackHitbox.width - 20
      : this.position.x + this.attackHitbox.offset.x + 20

    return {
      x: attackX,
      y: this.position.y + this.attackHitbox.offset.y,
      width: this.attackHitbox.width,
      height: this.attackHitbox.height,
    }
  }

  getSpecialAttackHitBox() {
    const specialAttackX = this.flip
      ? this.position.x + this.attackHitbox.offset.x - this.attackHitbox.width - 60
      : this.position.x + this.attackHitbox.offset.x + 60

    return {
      x: specialAttackX,
      y: this.position.y + this.attackHitbox.offset.y - 20,
      width: this.attackHitbox.width + 60,
      height: this.attackHitbox.height + 40,
    }
  }

  atacar() {
    if (!this.atacando) {
      this.atacando = true
      this.tempoAtaque = 0
    }
  }


  update(secondsPassed, context) {
    if (this.morto) {
      super.update(secondsPassed, context)

      // Verifica se a animação de morte terminou
      if (this.isAnimationDone && !this.deathAnimationComplete) {
        this.deathAnimationComplete = true
        console.log(`${this.nome} - Animação de morte completa, personagem vai desaparecer em 1 segundo`)

        // Espera 1 segundo e depois marca para desaparecer
        setTimeout(() => {
          this.shouldDisappear = true
          console.log(`${this.nome} desapareceu da tela`)
        }, 1000)
      }
      return
    }

    if (this.target) {
      const currentTime = performance.now()
      this.atualizarEstado(this.target, currentTime)
      this.executarComportamento(this.target, currentTime)
    }

    super.update(secondsPassed, context)
  }

  setTarget(target) {
    this.target = target
  }


  draw(context) {
    // Se deve desaparecer, não desenha nada
    if (this.shouldDisappear) {
      return
    }

    super.draw(context)

    // Não desenha UI se morto
    if (this.morto) return

    if (this.atacandoEspecial) {
      const especialAtk = this.getSpecialAttackHitBox()
      context.strokeStyle = "orange"
      context.lineWidth = 4
      context.strokeRect(especialAtk.x, especialAtk.y, especialAtk.width, especialAtk.height)

      context.fillStyle = "orange"
      context.font = "14px Arial"
      context.fillText("ESPECIAL V3", especialAtk.x, especialAtk.y - 5)
    }

    context.lineWidth = 1
  }

}
