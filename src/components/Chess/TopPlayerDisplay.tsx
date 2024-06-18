type PlayerDisplayProps = {
  imageSrc: string
  name: string | null
  time: string
}

const TopPlayerDisplay: React.FC<PlayerDisplayProps> = ({ imageSrc, name, time }) => {
  return (
    <div className="px-4 py-2 flex justify-between">
      <div className="flex justify-start items-center space-x-2">
        <img src={imageSrc} alt="avatar" width={30} height={30} />
        <p className="font-bold text-[14px] text-white">{name}</p>
      </div>
      <div className="flex justify-center items-center border bg-grey-100 border-b-4 border-grey-200 rounded-lg w-[100px] h-[40px]">
        <img src="/clock-stopwatch-white.svg" className="pr-1" />
        <div className="text-white font-ibm">{time}</div>
      </div>
    </div>
  )
}

export default TopPlayerDisplay
