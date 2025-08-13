import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/components/UserProvider";
import { createApplication } from "@/lib/api";
import { EmployeeInput } from "@/components/cold-email/EmployeeInput";
import { NamesList } from "@/components/cold-email/NamesList";
import { parseEmployeeNames } from "@/lib/parsing";

const ColdEmailer: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();

  const [isSending, setIsSending] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState("");
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [role, setRole] = useState("");

  const handleParse = () => {
    setIsParsing(true);
    const names = parseEmployeeNames(employeeInfo);
    setEmployeeNames(names);
    setIsParsing(false);
  };

  const removeName = (index: number) => {
    setEmployeeNames((prev) => prev.filter((_, i) => i !== index));
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
        company_name: "N/A",
        platform: "Random",
        status: "Applied",
        application_type: "cold_email",
        employee_names: employeeNames,
        domain,
      });
      toast({
        title: "Cold Email Sent!",
        description: `Your email has been sent.`,
      });
      // Clear fields
      setEmployeeInfo("");
      setEmployeeNames([]);
      setDomain("");
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
            <h1 className="text-3xl font-bold text-white mb-4">Cold Emailer</h1>
            <p className="text-lg text-stellar-cyan">
              Send a generic cold email
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-white font-medium">
                <span>Job Title</span>
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., SoftEngineer Intern"
                className="w-full p-4 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <EmployeeInput
              info={employeeInfo}
              setInfo={setEmployeeInfo}
              onParse={handleParse}
              isParsing={isParsing}
            />
            {employeeNames.length > 0 && (
              <NamesList names={employeeNames} onRemove={removeName} />
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
        </div>
      </div>
    </div>
  );
};

export default ColdEmailer;