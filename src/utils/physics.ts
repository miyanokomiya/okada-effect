import {
  Body,
  Bodies,
  Engine,
  Events,
  Runner,
  World,
  Vector,
  Vertices,
} from 'matter-js'
import okageo, { IVec2, ISvgPath, ISvgStyle } from 'okageo'
;(window as any).decomp = require('poly-decomp')

okageo.svg.configs.bezierSplitSize = 5
okageo.svg.configs.ellipseSplitSize = 10

export interface BodyShape {
  body: Body
  vertices: IVec2[]
  included: IVec2[][]
}

export class GameApp {
  private width: number
  private height: number
  private ctx: CanvasRenderingContext2D | null
  private engine: Engine
  private runner: Runner
  private shapeList: BodyShape[]
  private style: ISvgStyle

  constructor(args: { width: number; height: number }) {
    this.width = args.width
    this.height = args.height
    this.ctx = null
    this.engine = Engine.create()
    this.engine.world.gravity.x = 0
    this.engine.world.gravity.y = 0.1
    this.runner = Runner.create({})
    this.shapeList = []
    this.style = {
      ...okageo.svg.createStyle(),
      fill: true,
      fillStyle: 'gray',
      stroke: true,
      strokeStyle: 'yellow',
    }

    World.add(this.engine.world, getFrameBodies(this.width, this.height))
    Events.on(this.engine, 'afterUpdate', () => this.afterUpdate())
    this.draw()
    this.run()
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  public setGravity(x: number, y: number) {
    this.engine.world.gravity.x = x
    this.engine.world.gravity.y = y
  }

  public setStyle(style: Partial<ISvgStyle>) {
    this.style = { ...this.style, ...style }
  }

  public run() {
    Runner.start(this.runner, this.engine)
  }

  public stop() {
    Runner.stop(this.runner)
  }

  public step() {
    Engine.update(this.engine)
  }

  public clear() {
    Engine.clear(this.engine)
    this.shapeList.concat().forEach((s) => this.removeShape(s))
    this.shapeList = []
  }

  public dispose() {
    this.stop()
    Engine.clear(this.engine)
  }

  public isRunning() {
    return this.runner.enabled
  }

  private afterUpdate() {
    this.draw()
  }

  private draw() {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, this.width, this.height)
    drawFrame(this.ctx)

    this.shapeList.forEach((shape) => {
      if (!this.ctx) return
      this.ctx.save()
      this.ctx.translate(shape.body.position.x, shape.body.position.y)
      this.ctx.rotate(shape.body.angle)
      okageo.svg.draw(this.ctx, {
        d: shape.vertices,
        included: shape.included,
        style: this.style,
      })
      this.ctx.restore()
    })
  }

  public importPathList(pathList: ISvgPath[]): void {
    this.clear()
    this.shapeList = pathList
      .map((path) => createBody(path))
      .filter((s): s is BodyShape => !!s)
    this.shapeList.forEach((s) => this.addShape(s))
  }

  private addShape(shape: BodyShape): void {
    World.add(this.engine.world, [shape.body])
    this.shapeList.push(shape)
  }

  private removeShape(shape: BodyShape): void {
    World.remove(this.engine.world, shape.body)
    this.shapeList.splice(this.shapeList.indexOf(shape), 1)
  }
}

// 壁の厚み(半分は画面外)
export const FRAME_DEPTH = 10

export function getFrameBodies(width: number, height: number): Body[] {
  const frameTop = Bodies.rectangle(width / 2, 0, width, FRAME_DEPTH, {
    isStatic: true,
    friction: 1,
  })
  const frameBottom = Bodies.rectangle(width / 2, height, width, FRAME_DEPTH, {
    isStatic: true,
    friction: 1,
  })
  const frameLeft = Bodies.rectangle(0, height / 2, FRAME_DEPTH, height, {
    isStatic: true,
    friction: 1,
  })
  const frameRight = Bodies.rectangle(width, height / 2, FRAME_DEPTH, height, {
    isStatic: true,
    friction: 1,
  })
  return [frameTop, frameBottom, frameLeft, frameRight]
}

export function drawFrame(ctx: CanvasRenderingContext2D): void {
  if (!ctx) return
  ctx.fillStyle = 'gray'
  ctx.beginPath()
  ctx.rect(0, -FRAME_DEPTH / 2, ctx.canvas.clientWidth, FRAME_DEPTH)
  ctx.rect(
    0,
    ctx.canvas.clientHeight - FRAME_DEPTH / 2,
    ctx.canvas.clientWidth,
    FRAME_DEPTH,
  )
  ctx.rect(-FRAME_DEPTH / 2, 0, FRAME_DEPTH, ctx.canvas.clientHeight)
  ctx.rect(
    ctx.canvas.clientWidth - FRAME_DEPTH / 2,
    0,
    FRAME_DEPTH,
    ctx.canvas.clientHeight,
  )
  ctx.fill()
}

export function createBody(path: ISvgPath): BodyShape | null {
  const d = okageo.geo.omitSamePoint(path.d)
  const included = (path.included || []).map((inner) => {
    return okageo.geo.omitSamePoint(inner)
  })

  const poly = d.map((p) => Vector.create(p.x, p.y))
  const center = Vertices.centre(poly)
  const body = Bodies.fromVertices(center.x, center.y, [poly])

  if (!body) return null

  if (body) {
    body.friction = 0.1
    body.frictionAir = 0.01
  }
  const vertices = d.map((p) => ({
    x: p.x - body.position.x,
    y: p.y - body.position.y,
  }))
  return {
    body,
    included: included.map((inner: IVec2[]) => {
      return inner.map((p) => ({
        x: p.x - body.position.x,
        y: p.y - body.position.y,
      }))
    }),
    vertices,
  }
}
