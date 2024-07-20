import { Dialog, DialogButton } from 'konsta/react';
import CloseIcn from '../../assets/icons/close.svg';
import cn from '../../services/cn';

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
  buttons,
}: {
  title: string;
  className?: string;
  open: boolean;
  content: string | number | React.ReactNode;
  onHide: (e: unknown) => void;
  onOk: () => void;
  onCancel: () => void;
  okContent?: string;
  cancelContent?: string;
  buttons?: React.ReactNode;
}) => {
  return (
    <Dialog
      className={cn(
        'react-dialog min-w-[20rem] bg-black-linear border border-gray-800 shadow-general py-4 px-4 font-ibm',
        className
      )}
      opened={open}
      onBackdropClick={onHide}
      title={
        <div className="relative">
          <div className="capitalize text-lg text-center ios:font-bold material:font-boldm ios:text-white material:text-white">
            {title}
          </div>
          <div className="absolute ios:-top-2 ios:-right-6 material:-top-1 material:right-0">
            <img src={CloseIcn} alt="close-icn" className="cursor-pointer" onClick={onHide} />
          </div>
        </div>
      }
      content={<div className="py-2 text-center ios:text-white material:text-white">{content}</div>}
      buttons={
        buttons ? (
          buttons
        ) : (
          <div className="flex items-center w-full gap-2">
            <DialogButton
              className="bg-blue-gradient w-full rounded-xl after:hidden h-9 ios:text-black material:text-black shadow-general text-sm font-medium"
              onClick={onOk}
            >
              {okContent || 'Yes'}
            </DialogButton>
            <DialogButton
              className="bg-gray-800 w-full ios:text-white material:text-white rounded-xl h-9 shadow-general text-sm font-medium"
              onClick={onCancel}
            >
              {cancelContent || 'No'}
            </DialogButton>
          </div>
        )
      }
    />
  );
};

export default ReactDialog;
