import React from 'react'
import { Button, Icon } from 'konsta/react'

interface ActionButtonProps {
  label: string
  iconSrc: string
  onClick: any
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, iconSrc, onClick }) => (
  <Button
    onClick={onClick}
    className="bg-[linear-gradient(135deg,_#1F2428_0%,_#2E3E5E_100%)] text-[16px] text-black font-bold py-4 px-4 rounded-[16px] h-[140px] md:h-[160px] lg:h-[180px] w-[140px] md:w-[180px] lg:w-[200px] [box-shadow:0px_-4px_0px_0px_#00000033_inset]"
  >
    <div className="h-full flex flex-col gap-3">
      <span className="text-white font-ibm text-sm md:text-base lg:text-lg">{label}</span>
      <div className="flex items-center justify-center">
        <Icon
          ios={<img src={iconSrc} alt={label} className="h-12 w-auto md:h-16 lg:h-20" />}
          material={<img src={iconSrc} alt={label} className="h-12 w-auto md:h-16 lg:h-20" />}
        />
      </div>
    </div>
  </Button>
)

export default ActionButton
