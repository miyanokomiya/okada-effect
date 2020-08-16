import React, { useRef, useEffect, useMemo } from 'react'
import { StyleSheet, View, Platform } from 'react-native'
import Canvas from 'react-native-canvas'

type Props = {
  size: {
    width: number
    height: number
  }
  draw: (ctx: globalThis.CanvasRenderingContext2D) => void
}

const ECanvas: React.FC<Props> = (props) => {
  const $webCanvas = useRef<HTMLCanvasElement>(null)
  const $nativeCanvas = useRef<Canvas>(null)

  function handleCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, props.size.width, props.size.height)
    props.draw(ctx)
  }

  useEffect(() => {
    if (!$webCanvas.current) return
    handleCanvas($webCanvas.current)
  }, [props.size, props.draw, $webCanvas])

  useEffect(() => {
    if (!$nativeCanvas.current) return
    $nativeCanvas.current.width = props.size.width
    $nativeCanvas.current.height = props.size.height
    handleCanvas($nativeCanvas.current as any)
  }, [props.size, props.draw, $nativeCanvas])

  const gameCanvas = useMemo(() => {
    return Platform.OS === 'web' ? (
      <canvas {...props.size} ref={$webCanvas} />
    ) : (
      <Canvas ref={$nativeCanvas} />
    )
  }, [props.size])

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
