import React from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Registrar</h2>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[#ff7551] text-white rounded hover:bg-[#ff7551]/80"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
