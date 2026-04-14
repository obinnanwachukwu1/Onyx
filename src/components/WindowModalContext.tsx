import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './WindowModal.css';
import IconDialogError from '../assets/icons/IconDialogError.svg';
import IconDialogInformation from '../assets/icons/IconDialogInformation.svg';
import IconDialogWarning from '../assets/icons/IconDialogWarning.svg';
import IconDialogQuestion from '../assets/icons/IconDialogQuestion.svg';
import IconTaskComplete from '../assets/icons/IconTaskComplete.svg';

type WindowModalTone = 'default' | 'info' | 'warning' | 'danger' | 'success';

interface BaseModalOptions {
  title: string;
  message: string;
  tone?: WindowModalTone;
}

interface AlertOptions extends BaseModalOptions {
  confirmLabel?: string;
}

interface ConfirmOptions extends BaseModalOptions {
  confirmLabel?: string;
  cancelLabel?: string;
}

type ModalState =
  | {
      type: 'alert';
      title: string;
      message: string;
        tone: WindowModalTone;
        confirmLabel: string;
    }
  | {
      type: 'confirm';
      title: string;
      message: string;
        tone: WindowModalTone;
        confirmLabel: string;
        cancelLabel: string;
    };

interface WindowModalContextValue {
  showAlert: (options: AlertOptions) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  modal: ModalState | null;
  resolveModal: (confirmed: boolean) => void;
}

const WindowModalContext = createContext<WindowModalContextValue | null>(null);

export const WindowModalProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [modal, setModal] = useState<ModalState | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const resolveModal = useCallback((confirmed: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setModal(null);
    resolve?.(confirmed);
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setModal({
        type: 'alert',
        title: options.title,
        message: options.message,
        tone: options.tone ?? 'info',
        confirmLabel: options.confirmLabel ?? 'OK',
      });
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setModal({
        type: 'confirm',
        title: options.title,
        message: options.message,
        tone: options.tone ?? 'default',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
      });
    });
  }, []);

  useEffect(() => {
    if (!modal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        resolveModal(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal, resolveModal]);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  return (
    <WindowModalContext.Provider value={{ showAlert, showConfirm, modal, resolveModal }}>
      {children}
    </WindowModalContext.Provider>
  );
};

export const useWindowModal = () => {
  const context = useContext(WindowModalContext);
  if (!context) {
    throw new Error('useWindowModal must be used within a WindowModalProvider');
  }

  return {
    showAlert: context.showAlert,
    showConfirm: context.showConfirm,
  };
};

export const WindowModalHost = (): JSX.Element | null => {
  const context = useContext(WindowModalContext);
  if (!context || !context.modal) return null;

  const { modal, resolveModal } = context;
  const isAlert = modal.type === 'alert';
  const toneClass = `window-modal-panel-${modal.tone}`;
  const iconSource = modal.type === 'confirm'
    ? IconDialogQuestion
    : modal.tone === 'danger'
      ? IconDialogError
      : modal.tone === 'warning'
        ? IconDialogWarning
        : modal.tone === 'success'
          ? IconTaskComplete
          : modal.tone === 'info'
            ? IconDialogInformation
            : IconDialogQuestion;
  const iconAlt = modal.type === 'confirm'
    ? 'Question'
    : modal.tone === 'danger'
      ? 'Error'
      : modal.tone === 'warning'
        ? 'Warning'
        : modal.tone === 'success'
          ? 'Success'
          : modal.tone === 'info'
            ? 'Information'
            : 'Notice';

  return (
    <div
      className="window-modal-overlay"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        if (isAlert && event.target === event.currentTarget) {
          resolveModal(true);
        }
      }}
    >
      <div
        className={`window-modal-panel ${toneClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={modal.title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="window-modal-content-row">
          <div className="window-modal-icon-wrap">
            <img className="window-modal-icon" src={iconSource} alt={iconAlt} />
          </div>
          <div className="window-modal-copy">
            <h3 className="window-modal-title">{modal.title}</h3>
            <p className="window-modal-message">{modal.message}</p>
          </div>
        </div>
        <div className="window-modal-actions">
          {modal.type === 'confirm' && (
            <button
              className="window-modal-btn window-modal-btn-secondary"
              onClick={() => resolveModal(false)}
            >
              {modal.cancelLabel}
            </button>
          )}
          <button
            className={`window-modal-btn ${
              modal.tone === 'danger' ? 'window-modal-btn-danger' : 'window-modal-btn-primary'
            }`}
            onClick={() => resolveModal(true)}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
