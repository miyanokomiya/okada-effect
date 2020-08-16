import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import { Button, Input } from 'react-native-elements'
import ECanvas from './src/components/ECanvas'
import { parseFont } from './src/utils/font'
import okageo, { ISvgPath } from 'okageo'
import { GameApp, BodyShape } from './src/utils/physics'

type Size = {
  width: number
  height: number
}

const blockStyle = {
  ...okageo.svg.createStyle(),
  fill: true,
  fillStyle: 'gray',
  stroke: true,
  strokeStyle: 'yellow',
}

async function importFromString(text: string, size: Size): Promise<ISvgPath[]> {
  const margin = 10
  const pathInfoList = await parseFont(text, blockStyle)
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
    height: Dimensions.get('window').height * 0.8,
  }

  const [state, setState] = useState({
    text: 'ABC',
  })
  const [draftForm, setDraftForm] = useState({ text: 'ABC' })

  const [gameApp] = useState<GameApp>(new GameApp(canvasSize))
  useEffect(() => {
    return () => {
      gameApp.dispose()
    }
  }, [])

  const onInputText = useCallback(
    (text: string) => setDraftForm({ ...draftForm, text }),
    [],
  )
  const draw = useCallback((ctx: globalThis.CanvasRenderingContext2D) => {
    gameApp.setContext(ctx)
  }, [])
  const onClickReload = useCallback(() => {
    setState({ ...state, ...draftForm })
  }, [state, draftForm])

  useEffect(() => {
    importFromString(state.text, canvasSize).then((pathList) => {
      gameApp.importPathList(pathList)
    })
  }, [state.text])

  return (
    <View style={styles.root}>
      <ECanvas size={canvasSize} draw={draw} />
      <View style={styles.container}>
        <Input
          multiline
          label="text"
          value={draftForm.text}
          onChangeText={onInputText}
        />
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
