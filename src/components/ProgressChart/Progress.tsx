import React from 'react'
import './ProgressChart.scss'

type Props = {
  totalGames: number
  wins: number
  losses: number
}
const Progress = ({ totalGames, wins, losses }: Props) => {
  const lossPercentage = (losses / totalGames) * 100
  console.log(lossPercentage)
  return (
    <div className="vertical-semi-circle-progress-chart">
      <div className="chart-and-labels">
        <div
          className="semi-circle"
          style={{ background: `conic-gradient(#ff4500 0% 80%, #7fff00 80% 100%)` }}
        >
          <div className="semi-circle-overlay">
            <div className="text">
              <span>Game</span>
              <span>{totalGames}</span>
            </div>
          </div>
        </div>
        <div className="labels">
          <div className="label win text-white">
            <div className="count win">{wins}</div>
            <div>Win</div>
          </div>
          <div className="label lose">
            <div className="count lose">{losses}</div>
            <div>Lose</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress
