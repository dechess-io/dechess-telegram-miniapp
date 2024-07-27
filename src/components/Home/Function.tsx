import { Block } from 'konsta/react'
import Button from '../Button/Button'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../Button/ActionButton'
import { hasJWT } from '../../utils/utils'

const Function = () => {
  const navigate = useNavigate()

  const actionButtonsConfig = [
    { label: 'Leaderboard', iconSrc: '/Rank.svg', navigateTo: '/' },
    { label: 'Quest', iconSrc: '/layer.svg', navigateTo: '/' },
    { label: 'Play Versus Bot', iconSrc: '/ChessBoard.svg', navigateTo: '/bot' },
    { label: 'Puzzles', iconSrc: '/Piece.svg', navigateTo: '/' },
  ]

  const handlePlayClick = () => {
    navigate('/mode')
  }

  const createActionButton = (config: any) => (
    <ActionButton
      key={config.label}
      label={config.label}
      iconSrc={config.iconSrc}
      onClick={() => navigate(config.navigateTo)}
    />
  )

  return (
    <Block>
      <div className="grid grid-cols-2 gap-2 pb-2" style={{ background: 'transparent' }}>
        {actionButtonsConfig.map(createActionButton)}
      </div>
      <Button
        onClick={handlePlayClick}
        className="bg-[linear-gradient(90.15deg,_#67E4FF_0.07%,_#009ED0_98.38%)] text-black font-bold rounded-[16px] border-b-4 border-blue-200 font-ibm "
        disabled={!hasJWT()}
      >
        <span className="text-sm md:text-base lg:text-lg">Play</span>
      </Button>
    </Block>
  )
}

export default Function
