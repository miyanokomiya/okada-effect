import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import { Button, Input } from 'react-native-elements'
import ECanvas from './src/components/ECanvas'
import Canvas, { CanvasRenderingContext2D } from 'react-native-canvas'
import { parseFont } from './src/utils/font'
import okageo, { ISvgPath } from 'okageo'

type Size = {
  width: number
  height: number
}

async function importFromString(text: string, size: Size): Promise<ISvgPath[]> {
  const margin = 10
  const pathInfoList = await parseFont(text, {
    ...okageo.svg.createStyle(),
    fill: true,
    fillStyle: 'gray',
    stroke: true,
    strokeStyle: 'yellow',
  })
  return okageo.svg.fitRect(
    pathInfoList,
    margin,
    margin,
    size.width - margin * 2,
    size.height - margin * 2,
  )
}

export default function App() {
  const canvasSize: Size = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  }

  const [state, setState] = useState({ text: 'ABC', pathList: [] as ISvgPath[] })
  const [draftForm, setDraftForm] = useState({ text: 'ABC' })

  const onInputText = useCallback((text: string) => setDraftForm({ ...draftForm, text }), [])
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      state.pathList.forEach((p) => okageo.svg.draw(ctx as any, p))
    },
    [state.pathList],
  )
  const onClickReload = useCallback(() => {
    setState({ ...state, ...draftForm })
  }, [state, draftForm])

  useEffect(() => {
    importFromString(state.text, canvasSize).then((pathList) => setState({ ...state, pathList }))
  }, [state.text])

  return (
    <View style={styles.root}>
      <ECanvas size={canvasSize} draw={draw} />
      <View style={styles.container}>
        <Input multiline label="text" value={draftForm.text} onChangeText={onInputText} />
        <Button title="Reload" onPress={onClickReload} />
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
