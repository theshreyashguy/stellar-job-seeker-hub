import React, { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Send, ArrowLeft, User, X, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOpportunities } from "@/hooks/useJobOpportunities";
import { useUser } from "@/components/UserProvider";
import { createApplication } from "@/lib/api";

const EmailDetails = ({ role, company }: { role: string; company: string }) => (
  <div className="bg-stellar-navy/50 rounded-xl p-6">
    <h3 className="text-lg font-bold text-white mb-3">Email Details</h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-400">Position:</span>
        <span className="text-white">{role}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Company:</span>
        <span className="text-white">{company}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Date:</span>
        <span className="text-white">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

const EmployeeInput = ({
  info,
  setInfo,
  onParse,
  isParsing,
}: {
  info: string;
  setInfo: React.Dispatch<React.SetStateAction<string>>;
  onParse: () => void;
  isParsing: boolean;
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

const NamesList = ({
  names,
  onEdit,
  onRemove,
  editingIndex,
  editingValue,
  setEditingValue,
  onSave,
}: {
  names: string[];
  onEdit: (idx: number) => void;
  onRemove: (idx: number) => void;
  editingIndex: number | null;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
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
          {editingIndex === idx ? (
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
              onClick={() => onEdit(idx)}
              className="flex-1 cursor-pointer text-white"
            >
              {name}
            </span>
          )}
          <X
            size={16}
            onClick={() => onRemove(idx)}
            className="text-red-400 cursor-pointer ml-2"
          />
        </li>
      ))}
    </ul>
  </div>
);

const SentConfirmation = ({ company }: { company: string }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
      <CheckCircle className="w-10 h-10 text-green-500" />
    </div>
    <h2 className="text-2xl font-bold text-white">Cold Email Sent!</h2>
    <p className="text-gray-300">
      Your personalized cold email has been sent to relevant contacts at{" "}
      {company}.
    </p>
    <div className="flex justify-center space-x-4">
      <button
        onClick={() => window.location.assign("/analysis")}
        className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-6 py-3 rounded-lg"
      >
        View Analytics
      </button>
      <button
        onClick={() => window.location.assign("/")}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
      >
        Back to Home
      </button>
    </div>
  </div>
);

const ColdEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { opportunities } = useJobOpportunities(); // future use
  const user = useUser();

  const company = searchParams.get("company") || "Unknown Company";
  const role = searchParams.get("role") || "Unknown Role";
  const platform = searchParams.get("platform") || "Unknown";

  const [isSending, setIsSending] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState("");
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const parseEmployeeInfo = useCallback((info: string) => {
    setIsParsing(true);
    const lines = info
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const namesSet = new Set<string>();
    const suffixRegex =
      /\s*(?:\d+(?:st|nd|rd|th)[^ ]* degree connection|is open to work)$/i;

    lines.forEach((line) => {
      const cleanName = line.replace(suffixRegex, "").trim();
      if (cleanName) namesSet.add(cleanName);
    });

    setEmployeeNames(Array.from(namesSet));
    setIsParsing(false);
  }, []);

  const removeName = (index: number) => {
    setEmployeeNames((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(employeeNames[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      setEmployeeNames((prev) =>
        prev.map((name, i) => (i === editingIndex ? editingValue.trim() : name))
      );
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      await createApplication({
        user_id: user.ID,
        job_title: role,
        company_name: company,
        platform,
        status: "Applied",
        application_type: "cold_email",
      });
      setIsSent(true);
      toast({
        title: "Cold Email Sent!",
        description: `Your email regarding ${role} at ${company} has been sent.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send cold email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Send Cold Email
            </h1>
            <p className="text-xl text-stellar-purple font-medium">{role}</p>
            <p className="text-lg text-stellar-cyan">{company}</p>
          </div>

          {isSent ? (
            <SentConfirmation company={company} />
          ) : (
            <div className="space-y-6">
              <EmailDetails role={role} company={company} />
              <EmployeeInput
                info={employeeInfo}
                setInfo={setEmployeeInfo}
                onParse={() => parseEmployeeInfo(employeeInfo)}
                isParsing={isParsing}
              />
              {employeeNames.length > 0 && (
                <NamesList
                  names={employeeNames}
                  onEdit={startEditing}
                  onRemove={removeName}
                  editingIndex={editingIndex}
                  editingValue={editingValue}
                  setEditingValue={setEditingValue}
                  onSave={saveEdit}
                />
              )}
              <div className="text-center">
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto"
                >
                  <Send size={20} />
                  <span>{isSending ? "Sending..." : "Send Cold Email"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColdEmail;
