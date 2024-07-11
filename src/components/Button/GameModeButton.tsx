import React from 'react'
import { Block } from 'konsta/react'

interface GameModeButtonProps {
  title: string
  imageSrc: string
  rating: number
}

const GameModeButton: React.FC<GameModeButtonProps> = ({ title, imageSrc, rating }) => (
  <div className="flex flex-col items-center">
    <span className="text-white font-ibm">{title}</span>
    <div className="flex flex-row items-center gap-2">
      <img src={imageSrc} alt={title} className="h-24 w-24" />
      <span className="text-white font-ibm text-sm md:text-base lg:text-lg">{rating}</span>
    </div>
  </div>
)

export default GameModeButton
