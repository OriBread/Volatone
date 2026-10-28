import { useState } from 'react'

import { Visualisation } from './components/Visualisation'
import { useVolatoneStream } from './hooks/useVolatoneStream'
import { createAudioEngine } from './lib/audio'
import { streamUrl } from './lib/config'

export default function App() {
  // Created once. Safe in render: nothing touches audio until start() is called.
  const [audio] = useState(createAudioEngine)
  const [audioOn, setAudioOn] = useState(false)

  // Subscribe component to hook's state. Re-render on socket.onmessage and execute callback
  const { status, latest, events } = useVolatoneStream(streamUrl(), (event) =>
    audio.play(event.note),
  )

  const toggleAudio = async () => {
    if (audioOn) {
      audio.stop()
      setAudioOn(false)
    } else {
      await audio.start() // called from a click, so browser allows it
      setAudioOn(true)
    }
  }

  return (
    <main>
      <header>
        <h1>Volatone</h1>
        <p>Sonifying live market data</p>
        <button type="button" onClick={toggleAudio}>
          {audioOn ? 'Mute audio' : 'Enable audio'}
        </button>
      </header>
      <Visualisation status={status} latest={latest} events={events} />
    </main>
  )
}
