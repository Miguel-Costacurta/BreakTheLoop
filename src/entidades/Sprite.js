export class Sprite {
  constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, loop = true }) {
    this.position = position
    this.width = 50
    this.height = 150
    this.image = new Image()
    this.image.src = imageSrc
    this.scale = scale
    this.framesMax = framesMax
    this.frameCurrent = 0
    this.frameElapsed = 0
    this.frameHold = 7
    this.offset = offset
    this.flip = false
    this.loop = loop
    this.isAnimationDone = false
    this.currentSpriteName = null
  }

  draw(context, flip = false) {
    if (!this.image.complete) return
    context.save()
    if (flip) {
      context.translate(this.position.x + (this.image.width / this.framesMax) * this.scale, this.position.y)
      context.scale(-1, 1)
      context.drawImage(
        this.image,
        this.frameCurrent * (this.image.width / this.framesMax),
        0,
        this.image.width / this.framesMax,
        this.image.height,
        0 - this.offset.x,
        0 - this.offset.y,
        (this.image.width / this.framesMax) * this.scale,
        this.image.height * this.scale,
      )
    } else {
        context.drawImage(
            this.image,
            this.frameCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );
    }
      context.drawImage(
        this.image,
        this.frameCurrent * (this.image.width / this.framesMax),
        0,
        this.image.width / this.framesMax,
        this.image.height,
        this.position.x - this.offset.x,
        this.position.y - this.offset.y,
        (this.image.width / this.framesMax) * this.scale,
        this.image.height * this.scale,
      )
    }
    context.restore()
  }

  update(secondsPassed, context) {
    if (this.framesMax > 1) {
      this.frameElapsed += 0.5

      if (this.frameElapsed >= this.frameHold) {
        this.frameElapsed = 0

        if (this.frameCurrent < this.framesMax - 1) {
          this.frameCurrent++
        } else if (this.loop) {
          this.frameCurrent = 0
          this.isAnimationDone = false // Reset quando faz loop
        } else {
          // Animação terminou e não deve fazer loop
          this.isAnimationDone = true
          // Mantém no último frame
          this.frameCurrent = this.framesMax - 1
        }
      }
    }
  }

  // NOVO MÉTODO: Reset da animação
  resetAnimation() {
    this.frameCurrent = 0
    this.frameElapsed = 0
    this.isAnimationDone = false
  }

  // NOVO MÉTODO: Força o fim da animação
  finishAnimation() {
    this.frameCurrent = this.framesMax - 1
    this.isAnimationDone = true
  }
}