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
    <div className="flex-auto p-1 " key={buttonId}>
      <Button
        onClick={() => handleButtonClick(buttonId, timeStep, additionTime)}
        style={{
          backgroundImage: activeButton === buttonId ? 'url(/enable-button.png)' : 'url(/Mode.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100px',
          width: '100px',
        }}
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
