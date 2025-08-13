import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/components/UserProvider";
import { createApplication } from "@/lib/api";
import { EmployeeInput } from "@/components/cold-email/EmployeeInput";
import { NamesList } from "@/components/cold-email/NamesList";
import { parseEmployeeNames } from "@/lib/parsing";

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
  const user = useUser();

  const company = searchParams.get("company") || "Unknown Company";
  const role = searchParams.get("role") || "Unknown Role";
  const platform = searchParams.get("platform") || "Unknown";

  const [isSending, setIsSending] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState("");
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleParse = () => {
    setIsParsing(true);
    const names = parseEmployeeNames(employeeInfo);
    setEmployeeNames(names);
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
    if (!domain) {
      toast({
        title: "Domain Required",
        description: "Please enter a company domain.",
        variant: "destructive",
      });
      return;
    }
    setIsSending(true);
    try {
      await createApplication({
        user_id: user.ID,
        job_title: role,
        company_name: company,
        platform,
        status: "Applied",
        application_type: "cold_email",
        employee_names: employeeNames,
        domain,
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
                onParse={handleParse}
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
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <span>Company Domain</span>
                </label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., company.com"
                  className="w-full p-4 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              </div>
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