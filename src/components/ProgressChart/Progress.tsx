import React, { useEffect, useState } from 'react'
import './ProgressChart.scss'
import { Block } from 'konsta/react'

type Props = {
  totalGames: number
  wins: number
  losses: number
}
const Progress = ({ totalGames, wins, losses }: Props) => {
  const [rotateDeg, setRotateDeg] = useState<number | null>(null)

  useEffect(() => {
    const winPercentage = (wins / totalGames) * 100
    // -45 is the initial rotation angle ~ 0 win
    const calculatedRotateDeg = 360 + 45 - winPercentage * 1.8
    setRotateDeg(calculatedRotateDeg)
  }, [totalGames, wins, losses])
  return (
    <Block className="vertical-semi-circle-progress-chart">
      <div className="chart-and-labels gap-2">
        <div className={`semi-circle -rotate-[279deg]`}></div>
        <div className="semi-circle-overlay">
          <div className="text">
            <span className="font-ibm pr-2">Game</span>
            <span className="font-ibm pr-2">{totalGames}</span>
          </div>
        </div>
        <div className="labels gap-14 items-start">
          <div className="label win text-white">
            <div className="count win font-ibm">{wins}</div>
            <div className="flex justify-center items-center">Win</div>
          </div>
          <div className="label lose ">
            <div className="count lose font-ibm">{losses}</div>
            <div className="flex justify-center items-center">Lose</div>
          </div>
        </div>
      </div>
    </Block>
  )
}

export default Progress
