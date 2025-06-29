import type { FC } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '../types/budget';

export const Modal: FC<ModalProps> = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                {children}
            </div>
        </div>
    );
};