import React, { useRef, useEffect } from 'react'
import { StyleSheet, View, Platform } from 'react-native'
import Canvas, { CanvasRenderingContext2D } from 'react-native-canvas'

type Props = {
  size: {
    width: number
    height: number
  }
  draw?: (ctx: CanvasRenderingContext2D) => void
}

const ECanvas: React.FC<Props> = (props) => {
  const $canvas = useRef<HTMLCanvasElement>(null)

  function handleCanvas(canvas: Canvas) {
    if (!canvas) return
    canvas.width = props.size.width
    canvas.height = props.size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, props.size.width, props.size.height)
    props.draw(ctx)
  }

  useEffect(() => {
    if (!$canvas.current) return
    handleCanvas($canvas.current as any)
  }, [props.size, props.draw, $canvas])

  const gameCanvas =
    Platform.OS === 'web' ? (
      <canvas {...props.size} ref={$canvas} />
    ) : (
      <Canvas ref={$canvas} />
    )

  return (
    <View style={styles.canvasWrapper}>
      <View style={props.size}>{gameCanvas}</View>
    </View>
  )
}
export default ECanvas

const styles = StyleSheet.create({
  canvasWrapper: {
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
  },
})
