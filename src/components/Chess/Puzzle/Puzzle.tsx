import { App } from 'konsta/react'
import Header from '../../Header/Header'
import { useEffect, useMemo, useState } from 'react'
import { isAndroid } from 'react-device-detect'

interface ChessGame {
  player1: string
  player2: string
  opponent?: string
  location: string
  year: number
  fen: string
  moves: string
}

const Puzzle: React.FC = () => {
  const theme = useMemo(() => (isAndroid ? 'material' : 'ios'), [])

  const [chessGames, setChessGames] = useState<ChessGame[]>([])

  console.log(chessGames)

  useEffect(() => {
    fetch('/puzzle.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data: any) => {
        console.log(data)
        setChessGames(data.games)
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error)
      })
  }, [])

  return (
    <App theme={theme}>
      <Header />
      <div>
        <h1>Chess Games</h1>
        {chessGames.map((game: any, index: any) => (
          <div key={index}>
            <h2>
              {game.player1} vs {game.player2}
            </h2>
            <p>
              Location: {game.location}, Year: {game.year}
            </p>
            <p>FEN: {game.fen}</p>
            <p>Moves: {game.moves}</p>
          </div>
        ))}
      </div>
    </App>
  )
}

export default Puzzle
