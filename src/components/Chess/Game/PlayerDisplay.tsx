import React from 'react'

interface PlayerDisplayProps {
  imageSrc: string
  name: string | null
  time: string
  timeBoxClass: string
  clockIconSrc: string
  textColor: string
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({
  imageSrc,
  name,
  time,
  timeBoxClass,
  clockIconSrc,
  textColor,
}) => {
  return (
    <div className="flex justify-between">
      <div className="flex justify-start items-center space-x-2">
        <img src={imageSrc} alt="avatar" width={30} height={30} />
        <p className={`font-bold text-[14px] ${textColor}`}>{name}</p>
      </div>
      <div
        className={`flex justify-center items-center border ${timeBoxClass} rounded-lg w-[100px] h-[40px]`}
      >
        <img src={clockIconSrc} className="pr-1" alt="clock-icon" />
        <div className={`${textColor}`}>{time}</div>
      </div>
    </div>
  )
}

export default PlayerDisplay
