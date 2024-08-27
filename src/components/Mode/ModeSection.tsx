import { Button } from 'konsta/react'

type ModeSectionProps = {
  imgSrc: string
  title: string
  buttons: any
  activeButton: string | null
  handleButtonClick: (buttonId: string, timeStep: number, additionTime: number) => void
  isActive: boolean
}

const renderButton = (
  buttonId: string,
  label: string,
  timeStep: number,
  additionTime: number,
  activeButton: string | null,
  handleButtonClick: (buttonId: string, timeStep: number, additionTime: number) => void,
  isActive: boolean
) => {
  return (
    <div className="flex-auto p-1 " key={buttonId}>
      <Button
        className="focus:outline-none active:outline-none active:bg-transparent hover:bg-transparent"
        disabled={!isActive}
        onClick={() => handleButtonClick(buttonId, timeStep, additionTime)}
        style={{
          backgroundImage:
            activeButton === buttonId ? 'url(/gold-mode.svg)' : 'url(/normal-mode.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '80px',
          width: '80px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundImage = 'url(/gray-mode.svg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundImage =
            activeButton === buttonId ? 'url(/gold-mode.svg)' : 'url(/normal-mode.svg)'
        }}
      >
        <span className="text-white w-10 sm:w-14 truncate sm:text-sm text-sm lg:text-sm md:text-sm">
          {label}
        </span>
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
  isActive
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
            handleButtonClick,
            isActive
          )
        )}
      </div>
    </div>
  )
}

export default ModeSection
