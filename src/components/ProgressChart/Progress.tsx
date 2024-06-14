import React from 'react'
import './ProgressChart.scss'

type Props = {
  totalGames: number
  wins: number
  losses: number
}
const Progress = ({ totalGames, wins, losses }: Props) => {
  const lossPercentage = (losses / totalGames) * 100
  return (
    <div className="vertical-semi-circle-progress-chart">
      <div className="chart-and-labels">
        <div
          className="semi-circle"
          style={{ background: `conic-gradient(#ff4500 0% 50%, #7fff00 30% 20%)` }}
        >
          <div className="semi-circle-overlay">
            <div className="text">
              <span className="font-ibm pr-2">Game</span>
              <span className="font-ibm pr-2">{totalGames}</span>
            </div>
          </div>
        </div>
        <div className="labels">
          <div className="label win text-white">
            <div className="count win font-ibm">{wins}</div>
            <div className="">Win</div>
          </div>
          <div className="label lose ">
            <div className="count lose font-ibm">{losses}</div>
            <div className="font-ibm">Lose</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress
