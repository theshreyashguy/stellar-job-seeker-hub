
import React from "react";
import { User } from "lucide-react";

interface EmployeeInputProps {
  info: string;
  setInfo: React.Dispatch<React.SetStateAction<string>>;
  onParse: () => void;
  isParsing: boolean;
}

export const EmployeeInput: React.FC<EmployeeInputProps> = ({
  info,
  setInfo,
  onParse,
  isParsing,
}) => (
  <div className="space-y-3">
    <label className="flex items-center space-x-2 text-white font-medium">
      <User size={18} />
      <span>Employee/Contact</span>
    </label>
    <textarea
      value={info}
      onChange={(e) => setInfo(e.target.value)}
      placeholder="Paste raw LinkedIn info here..."
      className="w-full p-4 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
      rows={3}
    />
    <div className="text-center">
      <button
        onClick={onParse}
        disabled={isParsing}
        className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {isParsing ? "Parsing..." : "Parse Employee Info"}
      </button>
    </div>
  </div>
);
