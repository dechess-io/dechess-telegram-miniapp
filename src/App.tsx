import { useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'
import 'react-circular-progressbar/dist/styles.css'
import Progress from './components/ProgressChart/Progress'
import './index.css'
function App() {
  const navigate = useNavigate()
  const handlePlayClick = () => {
    navigate('/mode')
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
                  <div className="p-1 flex flex-col items-center">
                    <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137 border-b-2 border-grey-200">
                      <span className="text-white font-ibm ">Rabit</span>
                      <div className="flex flex-row items-center">
                        <img src="/QuickLock.svg" alt="Leaderboard" className="h-24 w-24" />
                        <span className="text-white font-ibm">500</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-1 flex flex-col items-center">
                    <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137 border-b-2 border-grey-200">
                      <span className="text-white font-ibm">Bullet</span>
                      <div className="flex flex-row items-center">
                        <img src="/bullet.svg" alt="Leaderboard" className="h-24 w-24" />
                        <span className="text-white font-ibm">500</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-1 flex flex-col items-center">
                    <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137 border-b-2 border-grey-200">
                      <span className="text-white font-ibm">Blitz</span>
                      <div className="flex flex-row items-center">
                        <img src="/Thunder.svg" alt="Leaderboard" className="h-24 w-24" />
                        <span className="text-white font-ibm">500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row space-x-2">
              <div className="flex-auto py-2">
                <button className="bg-darkblue-gradient text-black font-bold py-2 px-6 rounded-lg h-160 w-[180px] border-b-4 border-blue-100">
                  <span className="text-white font-ibm">Leaderboard</span>
                  <div className="flex items-center justify-center">
                    <img src="/Rank.svg" alt="Leaderboard" className="h-80 w-80" />
                  </div>
                </button>
              </div>
              <div className="flex-auto py-2">
                <button className="bg-darkblue-gradient text-black font-bold py-2 px-6 rounded-lg h-160 w-[180px] border-b-4 border-blue-100">
                  <span className="text-white font-ibm">Quest</span>
                  <div className="flex items-center justify-center">
                    <img src="/layer.svg" alt="Calendar" className="h-80 w-80" />
                  </div>
                </button>
              </div>
            </div>
            <div className="flex flex-row space-x-2 p-2">
              <div className="flex-auto">
                <button className="bg-darkblue-gradient text-black font-bold py-2 px-6 rounded-lg h-160 w-[180px] border-b-4 border-blue-100">
                  <span className="text-white font-ibm">Play Versus Bot</span>
                  <div className="flex items-center justify-center">
                    <img src="/ChessBoard.svg" alt="Robot" className="h-80 w-80" />
                  </div>
                </button>
              </div>
              <div className="flex-auto">
                <button className="bg-darkblue-gradient text-black font-bold py-2 px-6 rounded-lg h-160 w-[180px] border-b-4 border-blue-100">
                  <span className="text-white font-ibm">Puzzles</span>
                  <div className="flex items-center justify-center space-x-2">
                    <img src="/Piece.svg" alt="Puzzle" className="h-80 w-80" />
                  </div>
                </button>
              </div>
            </div>

            <div className="flex-auto p-4">
              <button
                className="bg-blue-gradient text-black font-bold py-2 px-6 rounded-lg h-64 w-[370px] border-b-4 border-blue-200"
                onClick={() => handlePlayClick()}
              >
                <span className="font-ibm">Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
