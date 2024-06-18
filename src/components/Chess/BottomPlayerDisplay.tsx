type PlayerDisplayProps = {
  imageSrc: string
  name: string | null
  time: string
}

const BottomPlayerDisplay: React.FC<PlayerDisplayProps> = ({ imageSrc, name, time }) => {
  return (
    <div className="py-2 flex justify-between">
      <div className="flex justify-start items-center space-x-2">
        <img src={imageSrc} alt="avatar" width={30} height={30} />
        <p className="font-bold text-[14px] text-white font-ibm">{name}</p>
      </div>
      <div className="flex justify-center items-center border bg-blue-gradient border-b-4 border-blue-200 rounded-lg w-[100px] h-[40px]">
        <img src="/clock-stopwatch-black.svg" className="pr-1" />
        <div className="text-black font-ibm">{time}</div>
      </div>
    </div>
  )
}

export default BottomPlayerDisplay
