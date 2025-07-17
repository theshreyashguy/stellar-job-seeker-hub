import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Send, ArrowLeft, User, X, Edit2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobOpportunities } from "@/hooks/useJobOpportunities";

const ColdEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { opportunities } = useJobOpportunities();

  const company = searchParams.get("company") || "Unknown Company";
  const role = searchParams.get("role") || "Unknown Role";

  const [isSending, setIsSending] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState("");
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const parseEmployeeInfo = (info: string) => {
    setIsParsing(true);

    // Split into non-empty, trimmed lines
    const lines = info
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const namesSet = new Set<string>();
    const suffixRegex =
      /\s*(?:\d+(?:st|nd|rd|th)[^ ]* degree connection|is open to work)$/i;

    for (const line of lines) {
      // If the line itself is just a descriptor, skip it
      if (/(degree connection|is open to work)$/i.test(line)) {
        // But we'll still process it to strip suffix out of the previous clean name
        const clean = line.replace(suffixRegex, "").trim();
        if (clean) namesSet.add(clean);
        continue;
      }

      // Otherwise strip any trailing descriptor and add
      const cleanName = line.replace(suffixRegex, "").trim();
      if (cleanName) {
        namesSet.add(cleanName);
      }
    }

    setEmployeeNames(Array.from(namesSet));
    setIsParsing(false);
  };

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
    setTimeout(() => {
      setIsSent(true);
      toast({
        title: "Cold Email Sent!",
        description: `Your email regarding ${role} at ${company} has been sent.`,
      });
      setIsSending(false);
    }, 2000);
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Send Cold Email
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-stellar-purple font-medium">{role}</p>
              <p className="text-lg text-stellar-cyan">{company}</p>
            </div>
          </div>

          {isSent ? (
            /* Sent Confirmation */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Cold Email Sent!
              </h2>
              <p className="text-gray-300">
                Your personalized cold email has been sent to relevant contacts
                at {company}.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/analysis")}
                  className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-6 py-3 rounded-lg"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <div className="space-y-6">
              {/* Email Details */}
              <div className="bg-stellar-navy/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">
                  Email Details
                </h3>
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
                    <span className="text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Input & Parse Button */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <User size={18} />
                  <span>Employee/Contact</span>
                </label>
                <textarea
                  value={employeeInfo}
                  onChange={(e) => setEmployeeInfo(e.target.value)}
                  placeholder="Paste raw LinkedIn info here..."
                  className="w-full p-4 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
                <div className="text-center">
                  <button
                    onClick={() => parseEmployeeInfo(employeeInfo)}
                    disabled={isParsing}
                    className="bg-stellar-cyan hover:bg-stellar-cyan/80 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 "
                  >
                    <span>
                      {isParsing ? "Parsing..." : "Parse Employee Info"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Extracted Names with Edit & Remove */}
              {employeeNames.length > 0 && (
                <div className="bg-stellar-navy/50 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Extracted Employee Names:
                  </h4>
                  <ul className="space-y-2">
                    {employeeNames.map((name, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between bg-gray-700/20 p-2 rounded-lg"
                      >
                        {editingIndex === idx ? (
                          <input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            autoFocus
                            className="flex-1 bg-transparent border-b border-gray-400 text-white px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(idx)}
                            className="flex-1 cursor-pointer text-white"
                          >
                            {name}
                          </span>
                        )}
                        <X
                          size={16}
                          onClick={() => removeName(idx)}
                          className="text-red-400 cursor-pointer ml-2"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Send Button */}
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
