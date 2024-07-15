import { Dialog, DialogButton } from 'konsta/react'
import CloseIcn from '../../assets/icons/close.svg'
import cn from '../../services/cn'

const ReactDialog = ({
  title,
  className,
  open,
  content,
  onHide,
  onOk,
  onCancel,
  okContent,
  cancelContent,
}: {
  title: string
  className?: string
  open: boolean
  content: string | number | React.ReactNode
  onHide: (e: unknown) => void
  onOk: () => void
  onCancel: () => void
  okContent?: string
  cancelContent?: string
}) => {
  return (
    <Dialog
      className={cn(
        'react-dialog min-w-[20rem] bg-black-linear border border-gray-800 shadow-general pb-4 px-4 font-ibm',
        className
      )}
      opened={open}
      onBackdropClick={onHide}
      title={
        <div className="relative">
          <div className="capitalize">{title}</div>
          <div className="absolute -top-2 -right-6">
            <img src={CloseIcn} alt="close-icn" className="cursor-pointer" onClick={onHide} />
          </div>
        </div>
      }
      content={<div className="py-2">{content}</div>}
      buttons={
        <div className="flex items-center w-full gap-2">
          <DialogButton
            className="bg-blue-gradient rounded-xl after:hidden h-9 text-black font-medium shadow-general"
            onClick={onOk}
          >
            {okContent || 'Yes'}
          </DialogButton>
          <DialogButton
            className="bg-gray-800 rounded-xl h-9 font-medium shadow-general"
            onClick={onCancel}
          >
            {cancelContent || 'No'}
          </DialogButton>
        </div>
      }
    />
  )
}

export default ReactDialog
