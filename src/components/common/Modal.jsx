import { X } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import useScrollLock from "../../hooks/useScrollLock";

// Children can portal content (e.g. a confirm button) into this element so it stays
// pinned below the scrolling body, like the Call Ambulance modal footer.
const ModalFooterContext = createContext(null);
export const useModalFooter = () => useContext(ModalFooterContext);

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "600px",
  hideHeader = false,
  className = "",
  bodyClassName = "",
  contentStyle = {},
  bodyStyle = {}
}) {
  const [footerEl, setFooterEl] = useState(null);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const content = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth, ...contentStyle }}
      >
        {!hideHeader && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        )}
        <ModalFooterContext.Provider value={footerEl}>
          <div className={`modal-body ${bodyClassName}`.trim()} style={bodyStyle}>
            {children}
          </div>
        </ModalFooterContext.Provider>
        <div className="modal-footer-slot" ref={setFooterEl} />
      </div>
    </div>
  );

  if (typeof window === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}
