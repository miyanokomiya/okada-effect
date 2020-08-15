import { StatusBar } from 'expo-status-bar'
import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import { Card, Button, Input } from 'react-native-elements'
import ECanvas from './src/components/ECanvas'
import type { CanvasRenderingContext2D } from 'react-native-canvas'

export default function App() {
  const canvasSize = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  }

  const [state, setState] = useState({ text: 'ABC' })

  const onInputText = useCallback((text: string) => setState({ text }), [])
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = 'purple'
      ctx.fillRect(30, 50, 100, 50)
      ctx.strokeText(state.text, 20, 20)
    },
    [state.text],
  )

  return (
    <View style={styles.root}>
      <ECanvas size={canvasSize} draw={draw} />
      <View style={styles.container}>
        <Text>{state.text}</Text>
        <StatusBar style="auto" />
        <Card title="入力してね">
          <Input label="text" value={state.text} onChangeText={onInputText} />
          <Button title="Entry" buttonStyle={{ marginTop: 30, borderRadius: 20 }} />
        </Card>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 30,
    paddingBottom: 30,
  },
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
