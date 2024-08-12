import { App, BlockTitle, List, ListItem, Block } from 'konsta/react'
import Header from '../../Header/Header'
import { useEffect, useMemo, useState } from 'react'
import { isAndroid } from 'react-device-detect'
import PuzzleGame from './PuzzleGame'

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
  const [showPuzzle, setShowPuzzle] = useState(true)
  const [fen, setFen] = useState('')

  const [chessGames, setChessGames] = useState<ChessGame[]>([])

  useEffect(() => {
    fetch('/puzzle.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data: any) => {
        setChessGames(data.games)
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error)
      })
  }, [])

  const handleClick = (fen: string) => {
    setFen(fen)
    setShowPuzzle(false)
  }

  return (
    <App theme={theme}>
      <Header />
      <List strongIos outlineIos>
        {showPuzzle &&
          chessGames.map((game: any, index: any) => (
            <ListItem
              media={<img src="/Logo.svg" className="h-4 w-4" />}
              link
              title={`Problem ${index + 1}`}
              onClick={() => handleClick(game.fen)}
            />
          ))}
        {!showPuzzle && <PuzzleGame fen={fen} />}
      </List>
    </App>
  )
}

export default Puzzle
