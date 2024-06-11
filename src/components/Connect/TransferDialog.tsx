import { useState } from 'react'

export function TransferDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Dialog Trigger */}
      <button className="secondary" onClick={() => setIsOpen(true)}>
        Transfer Funds
      </button>

      {/* Transfer Dialog */}
      <dialog open={isOpen}>
        <article>
          <a
            href="#close"
            aria-label="Close"
            className="close"
            data-target="modal-example"
            onClick={() => setIsOpen(false)}
          ></a>
          <h3>Transfer Funds</h3>

          <TransferDialogForm onCloseDialog={() => setIsOpen(false)} />
        </article>
      </dialog>
    </>
  )
}

interface TransferDialogFormProps {
  onCloseDialog: () => void
}
function TransferDialogForm({ onCloseDialog }: TransferDialogFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)

    try {
      onCloseDialog()
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Transfer form */}
      <form>
        <label htmlFor="transfer-address">
          Destination Address (SS58)
          <input
            type="text"
            id="transfer-address"
            name="transfer-address"
            placeholder="5FE51…xe1XL"
            required
          />
        </label>

        <label htmlFor="transfer-amount">
          Amount
          <input
            type="number"
            id="transfer-amount"
            name="transfer-amount"
            placeholder="10.0"
            min={0}
            required
          />
        </label>
      </form>
      {/* Footer */}
      <div className="grid" style={{ marginTop: '1rem', marginBottom: '-2rem' }}>
        <button className="secondary" onClick={onCloseDialog} disabled={isLoading}>
          Cancel
        </button>
        <button onClick={handleConfirm} aria-busy={isLoading} disabled={isLoading}>
          Confirm
        </button>
      </div>
    </>
  )
}
