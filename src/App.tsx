import { useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'
import 'react-circular-progressbar/dist/styles.css'
import Progress from './components/ProgressChart/Progress'
import './index.css'
import { hasJWT } from './utils/utils'
import Button from './components/Button/Button'
function App() {
  const navigate = useNavigate()
  const handlePlayClick = () => {
    navigate('/mode')
  }

  const renderActionButton = (label: string, iconSrc: string) => {
    return (
      <div className="flex-auto py-2">
        <button className="bg-darkblue-gradient text-black font-bold py-2 px-6 rounded-lg h-160 w-[180px] border-b-4 border-blue-100">
          <span className="text-white font-ibm">{label}</span>
          <div className="flex items-center justify-center">
            <img src={iconSrc} alt={label} className="h-80 w-80" />
          </div>
        </button>
      </div>
    )
  }

  const renderGameMode = (title: string, imageSrc: string, rating: number) => {
    return (
      <div className="p-1 flex flex-col items-center">
        <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137 border-b-2 border-grey-200">
          <span className="text-white font-ibm">{title}</span>
          <div className="flex flex-row items-center">
            <img src={imageSrc} alt={title} className="h-24 w-24" />
            <span className="text-white font-ibm">{rating}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="flex flex-col pt-6 bg-gray-1000">
        <div className="border-none rounded-xl max-w-[380px] mx-auto min-h-screen">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-white px-6 py-12">
            <div className="flex flex-row bg-black-gradient w-[370px] h-227 rounded-lg pl-2">
              <div className="flex-auto ">
                <Progress losses={5} totalGames={10} wins={5} />
              </div>
              <div className="flex-auto  flex items-center justify-center"></div>
              <div className="flex-auto  rounded-lg">
                <div>
                  <div>
                    <h3 className="font-ibm">Elo Rating</h3>
                  </div>
                  {renderGameMode('Rabit', '/QuickLock.svg', 500)}
                  {renderGameMode('Bullet', '/bullet.svg', 500)}
                  {renderGameMode('Blitz', '/Thunder.svg', 500)}
                </div>
              </div>
            </div>
            <div className="flex flex-row space-x-2">
              {renderActionButton('Leaderboard', '/Rank.svg')}
              {renderActionButton('Quest', '/layer.svg')}
            </div>
            <div className="flex flex-row space-x-2 p-2">
              {renderActionButton('Play Versus Bot', '/ChessBoard.svg')}
              {renderActionButton('Puzzles', '/Piece.svg')}
            </div>

            <div className="flex-auto p-4">
              <Button
                onClick={handlePlayClick}
                className="bg-blue-gradient text-black font-bold py-2 px-6 rounded-lg h-64 w-[370px] border-b-4 border-blue-200 font-ibm"
                disabled={!hasJWT()}
              >
                <span>Play</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
