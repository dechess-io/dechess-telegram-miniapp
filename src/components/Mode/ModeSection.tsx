import { Button } from 'konsta/react'

type ModeSectionProps = {
  imgSrc: string
  title: string
  buttons: any
  activeButton: string | null
  handleButtonClick: (buttonId: string, timeStep: number, additionTime: number) => void
}

const renderButton = (
  buttonId: string,
  label: string,
  timeStep: number,
  additionTime: number,
  activeButton: string | null,
  handleButtonClick: (buttonId: string, timeStep: number, additionTime: number) => void
) => {
  return (
    <div className="flex-auto p-1" key={buttonId}>
      <Button
        className={`font-bold py-2 px-6 rounded-lg h-54 w-30 ${
          activeButton === buttonId
            ? 'bg-blue-gradient border-b-4 border-blue-200'
            : 'bg-grey-100 border-b-4 border-grey-200'
        }`}
        onClick={() => handleButtonClick(buttonId, timeStep, additionTime)}
      >
        <span className="text-white w-10 sm:w-14 truncate sm:text-base text-sm">{label}</span>
      </Button>
    </div>
  )
}

const ModeSection: React.FC<ModeSectionProps> = ({
  imgSrc,
  title,
  buttons,
  activeButton,
  handleButtonClick,
}) => {
  return (
    <div className="pt-2">
      <div className="flex flex-row items-center pl-4">
        <img src={imgSrc} alt={title} className="h-24 w-24" />
        <span className="text-white pl-2">{title}</span>
      </div>
      <div className="flex flex-row">
        {buttons.map((button: any) =>
          renderButton(
            button.id,
            button.label,
            button.time,
            button.increment,
            activeButton,
            handleButtonClick
          )
        )}
      </div>
    </div>
  )
}

export default ModeSection
