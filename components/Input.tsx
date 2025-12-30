import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="font-bold text-xs text-brand-deep/60 uppercase tracking-wider ml-4">{label}</label>}
      <input
        className={`w-full px-6 py-4 bg-white text-brand-deep text-lg rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-bright/20 transition-all placeholder:text-brand-deep/30 ${className}`}
        {...props}
      />
    </div>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="font-bold text-xs text-brand-deep/60 uppercase tracking-wider ml-4">{label}</label>}
      <textarea
        className={`w-full px-6 py-4 bg-white text-brand-deep text-lg rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-bright/20 transition-all resize-none placeholder:text-brand-deep/30 ${className}`}
        {...props}
      />
    </div>
  );
};
