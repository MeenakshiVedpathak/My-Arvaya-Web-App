import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function Toast({ isOpen, message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose, message]);

  if (!isOpen) return null;

  const getIcon = () => {
    if (type === "success") return <CheckCircle size={20} color="var(--success, #059669)" />;
    if (type === "error") return <XCircle size={20} color="var(--danger, #dc2626)" />;
    return null;
  };

  const getBackground = () => {
    if (type === "success") return "var(--success-light, #d1fae5)";
    if (type === "error") return "var(--danger-light, #fee2e2)";
    return "white";
  };

  const getTextColor = () => {
    if (type === "success") return "var(--success, #059669)";
    if (type === "error") return "var(--danger, #dc2626)";
    return "var(--text-main)";
  };

  const content = (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 99999999,
        background: getBackground(),
        color: getTextColor(),
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "300px",
        maxWidth: "400px",
        animation: "fadeIn 0.3s ease-out forwards",
        border: `1px solid ${getTextColor()}33`
      }}
    >
      {getIcon()}
      <span style={{ fontWeight: "600", fontSize: "14px", flex: 1 }}>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: getTextColor(),
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0
        }}
      >
        <X size={18} />
      </button>
    </div>
  );

  if (typeof window === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}
