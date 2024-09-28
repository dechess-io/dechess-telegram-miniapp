import { Block, Button, Card, Icon } from 'konsta/react'

type ModeSectionProps = {
  imgSrc: string
  title: string
  buttons: ButtonConfig[]
  activeButton: string | null
  handleButtonClick: (buttonId: string, timeStep: number, additionTime: number) => void
  isActive: boolean
}

type ButtonConfig = {
  id: string
  label: string
  time: number
  increment: number
}

const ModeButton: React.FC<{
  buttonId: string
  label: string
  timeStep: number
  additionTime: number
  isActive: boolean
  activeButton: string | null
  handleButtonClick: (buttonId: string, timeStep: number, additionTime: number) => void
}> = ({ buttonId, label, timeStep, additionTime, isActive, activeButton, handleButtonClick }) => {
  const isActiveButton = activeButton === buttonId

  const getBackgroundImage = (hovered: boolean = false) => {
    if (hovered) return 'url(/gray-mode.svg)'
    return isActiveButton ? 'url(/gold-mode.svg)' : 'url(/normal-mode.svg)'
  }

  return (
    <Button
      className="focus:outline-none active:outline-none "
      disabled={!isActive}
      onClick={() => handleButtonClick(buttonId, timeStep, additionTime)}
      style={{
        backgroundImage: getBackgroundImage(),
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '80px',
        width: '80px',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundImage = getBackgroundImage(true))}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundImage = getBackgroundImage())}
    >
      <span className="text-white w-full sm:w-auto sm:text-sm text-sm lg:text-sm md:text-sm lowercase">
        {label}
      </span>
    </Button>
  )
}

const ModeSection: React.FC<ModeSectionProps> = ({
  imgSrc,
  title,
  buttons,
  activeButton,
  handleButtonClick,
  isActive,
}) => {
  return (
    <div className="bg-transparent">
      <div className="flex flex-row items-center pl-2">
        <img src={imgSrc} alt={title} className="h-24 w-24" />
        <span className="text-white pl-2 text-lg font-semibold  tracking-wide">{title}</span>
      </div>
      <div className="flex flex-row gap-7">
        {buttons.map(({ id, label, time, increment }) => (
          <ModeButton
            key={id}
            buttonId={id}
            label={label}
            timeStep={time}
            additionTime={increment}
            activeButton={activeButton}
            handleButtonClick={handleButtonClick}
            isActive={isActive}
          />
        ))}
      </div>
    </div>
  )
}

export default ModeSection
