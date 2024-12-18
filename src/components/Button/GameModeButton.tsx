import React from 'react'

interface GameModeButtonProps {
  title: string
  imageSrc: string
  rating: number
}

const GameModeButton: React.FC<GameModeButtonProps> = ({ title, imageSrc, rating }) => (
  <div className="flex flex-col items-center">
    <span className="text-white">{title}</span>
    <div className="flex flex-row items-center gap-2">
      <img src={imageSrc} alt={title} className="h-24 w-24" />
      <span className="text-white text-sm md:text-base lg:text-lg">{rating}</span>
    </div>
  </div>
)

export default GameModeButton
