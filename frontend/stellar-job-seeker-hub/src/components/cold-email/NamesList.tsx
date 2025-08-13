
import React from "react";
import { X, Edit2 } from "lucide-react";

interface NamesListProps {
  names: string[];
  onRemove: (idx: number) => void;
  onEdit?: (idx: number) => void;
  editingIndex?: number | null;
  editingValue?: string;
  setEditingValue?: React.Dispatch<React.SetStateAction<string>>;
  onSave?: () => void;
}

export const NamesList: React.FC<NamesListProps> = ({
  names,
  onRemove,
  onEdit,
  editingIndex,
  editingValue,
  setEditingValue,
  onSave,
}) => (
  <div className="bg-stellar-navy/50 rounded-xl p-4">
    <h4 className="text-lg font-bold text-white mb-2">
      Extracted Employee Names:
    </h4>
    <ul className="space-y-2">
      {names.map((name, idx) => (
        <li
          key={idx}
          className="flex items-center justify-between bg-gray-700/20 p-2 rounded-lg"
        >
          {onSave && setEditingValue && editingIndex === idx ? (
            <input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={onSave}
              onKeyDown={(e) => e.key === "Enter" && onSave()}
              autoFocus
              className="flex-1 bg-transparent border-b border-gray-400 text-white px-2 py-1 focus:outline-none"
            />
          ) : (
            <span
              onClick={() => onEdit && onEdit(idx)}
              className={`flex-1 text-white ${onEdit ? 'cursor-pointer' : ''}`}
            >
              {name}
            </span>
          )}
          <div className="flex items-center">
            {onEdit && editingIndex !== idx && (
              <Edit2
                size={16}
                onClick={() => onEdit(idx)}
                className="text-gray-400 cursor-pointer mr-2"
              />
            )}
            <X
              size={16}
              onClick={() => onRemove(idx)}
              className="text-red-400 cursor-pointer"
            />
          </div>
        </li>
      ))}
    </ul>
  </div>
);
