import { useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer.tsx'
import { useEffect, useState } from 'react'
import { socket } from './services/socket.ts'
import { Page } from 'konsta/react'
import './index.css'
import { Block, App as KonstaApp } from 'konsta/react'

import { isAndroid } from 'react-device-detect'
import ReactDialog from './components/Dialog/ReactDialog.tsx'
import Banner from './components/Home/Banner.tsx'
import Function from './components/Home/Function.tsx'

function App() {
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)
  const [data, setData] = useState<any>()

  useEffect(() => {
    socket.emit('reconnect')
  }, [])

  useEffect(() => {
    socket.on('rejoinGame', (data) => {
      if (data.status === 200 && data.game_id) {
        setData(data)
        setTimeout(() => {
          setShowPopup(true)
        }, 1500)
      }
    })
  }, [])

  const handleRejoin = () => {
    navigate('/game/' + data.game_id)
    setShowPopup(false)
  }

  const handleCancel = () => {
    setShowPopup(false)
    socket.emit('resign', {
      game_id: data.game_id,
      isGameOver: true,
      isGameDraw: false,
      winner: data.opponent,
      loser: data.user,
    })
  }

  const theme = isAndroid ? 'material' : 'ios'

  return (
    <>
      <KonstaApp className="font-space font-medium" theme={theme}>
        <Page className="overflow-auto hide-scrollbar">
          <Header />
          <ReactDialog
            open={showPopup}
            onHide={() => setShowPopup(false)}
            title=""
            content="You have an unfinished game. Do you want to rejoin?"
            onOk={handleRejoin}
            onCancel={handleCancel}
          />
          <Block>
            <div className="w-full flex flex-col items-center justify-center text-center text-white">
              <Banner />
              <Function />
            </div>
          </Block>

          <Footer />
        </Page>
      </KonstaApp>
    </>
  )
}

export default App
