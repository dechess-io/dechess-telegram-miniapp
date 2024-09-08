import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../../services/socket'
import { formatTime, hasJWT } from '../../utils/utils'
import GameSpinner from '../Loading/Spinner'
import ModeSection from './ModeSection'
import { Block, Button } from 'konsta/react'
import { useAppDispatch } from '../../redux/store'
import { resetGame } from '../../redux/game/action'
import LOGO_DECHESS from '../../../public/images/logo-dechess.svg'
import ButtonV2 from '../Button/ButtonV2'
import FooterV2 from '../../layouts/Footer/FooterV2'

const buttonsData = {
  bullet: [
    { id: 'bullet-1', label: '1 min', time: 1, increment: 0 },
    { id: 'bullet-2', label: '1|1', time: 1, increment: 1 },
    { id: 'bullet-3', label: '2|1', time: 2, increment: 1 },
  ],
  blitz: [
    { id: 'blitz-1', label: '3 min', time: 3, increment: 0 },
    { id: 'blitz-2', label: '3|2', time: 3, increment: 2 },
    { id: 'blitz-3', label: '5 min', time: 5, increment: 0 },
  ],
  rapid: [
    { id: 'rapid-1', label: '10 min', time: 10, increment: 0 },
    { id: 'rapid-2', label: '15|10', time: 15, increment: 10 },
    { id: 'rapid-3', label: '30 min', time: 30, increment: 0 },
  ],
  daily: [
    { id: 'daily-1', label: '10 min', time: 10, increment: 0 },
    { id: 'daily-2', label: '15|10', time: 15, increment: 10 },
    { id: 'daily-3', label: '30 min', time: 30, increment: 0 },
  ],
}

type ModeProps = {
  isBotMode: boolean
}

const Mode: React.FC<ModeProps> = ({ isBotMode }) => {
  const navigate = useNavigate()
  const gameDispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [activeButton, setActiveButton] = useState(null)
  const [timeStep, setTimestep] = useState(0)
  const [additionTimePerMove, setAdditionTimePerMove] = useState(0)

  let timerInterval: any

  useEffect(() => {
    function onConnect() {}
    function onDisconnect() {}

    socket.on('connection', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connection', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      startTimer()
    } else {
      clearInterval(timerInterval)
    }

    return () => clearInterval(timerInterval)
  }, [loading])

  const startTimer = () => {
    timerInterval = setInterval(() => {
      setTotalSeconds((prevSeconds) => prevSeconds + 1)
    }, 1000)
  }

  useEffect(() => {
    if (totalSeconds > 30 && !isBotMode) {
      removeLocalStorage()
      gameDispatch(resetGame())
      navigate(`/game-bot?time=${timeStep}&increment=${additionTimePerMove}`)
    }
  }, [totalSeconds])

  const handleCancel = () => {
    socket.emit('cancelCreateGame', (response: any) => {
      if (response.status === 200) {
        setLoading(false)
        setTotalSeconds(0)
      }
    })
  }

  const removeLocalStorage = () => {}

  const onCreateGame = async () => {
    await gameDispatch(resetGame())
    setLoading(true)
    if (isBotMode) {
      removeLocalStorage()
      gameDispatch(resetGame())
      navigate(`/game-bot?time=${timeStep}&increment=${additionTimePerMove}`)
    } else {
      removeLocalStorage()
      socket.emit('createGame', { timeStep, additionTimePerMove }, (response: any) => {
        if (response.status === 200) {
          setLoading(false)
          removeLocalStorage()
          navigate(`/game/${response.board.game_id}`)
        } else if (response.status === 202) {
          console.log('Waiting for an opponent...')
        } else {
          setLoading(false)
          console.error('Failed to create game')
        }
      })

      socket.on('createGame', async function (data) {
        if (data.status === 200) {
          setLoading(false)
          removeLocalStorage()
          gameDispatch(resetGame())
          navigate(`/game/${data.board.game_id}`)
        }
      })
    }
  }

  const handleButtonClick = (buttonId: any, timeStep: number, additionTime: number) => {
    setActiveButton(buttonId)
    setTimestep(timeStep)
    setAdditionTimePerMove(additionTime)
  }

  return (
    <div
      className="h-screen bg-center bg-contain"
      style={{ backgroundImage: 'url(./images/bg-game.png)' }}
    >
      <img className="max-w-[120px] max-h-[40px] mx-auto" src={LOGO_DECHESS} alt="DeChess Logo" />
      <div className="flex flex-col">
        <div className="border-none">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-white">
            {loading && (
              <>
                <GameSpinner />
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 z-50 rounded-lg">
                  <Block>
                    <div className="time-counter pb-[10px]">{formatTime(totalSeconds)}</div>

                    <Button
                      className="cancel-button flex items-center justify-center text-center font-bold py-2 px-6 rounded-lg bg-grey-300 border-b-4 border-grey-200"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Block>
                </div>
              </>
            )}
            <Block>
              <ModeSection
                imgSrc="/bullet.svg"
                title="Bullet (Soon)"
                buttons={buttonsData.bullet}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
                isActive={false}
              />
              <ModeSection
                imgSrc="/Thunder.svg"
                title="Blitz"
                buttons={buttonsData.blitz}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
                isActive={true}
              />
              <ModeSection
                imgSrc="/QuickLock.svg"
                title="Rapid (Soon)"
                buttons={buttonsData.rapid}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
                isActive={false}
              />

              <div className="w-full text-center text-black active:bg-transparent hover:bg-transparent">
                <ButtonV2
                  onClick={onCreateGame}
                  className="text-black h-40 w-[370px] active:bg-transparent hover:bg-transparent"
                  disabled={!hasJWT() || !activeButton}
                >
                  Play Now
                </ButtonV2>
              </div>
              <div className="flex item-center justify-center">
                <FooterV2 activeIndex={0} />
              </div>
            </Block>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mode
