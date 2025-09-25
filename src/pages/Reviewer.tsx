import { useState } from "react";
import CompanySelector from "@/components/reviewer/CompanySelector";
import ReviewTable from "@/components/reviewer/ReviewTable";
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2,
  FileText,
  Calendar
} from "lucide-react";

const Reviewer = () => {
  const [selectedCompany, setSelectedCompany] = useState<{id: string, name: string} | null>(null);

  if (selectedCompany) {
    return (
      <ReviewTable
        companyId={selectedCompany.id}
        companyName={selectedCompany.name}
        onBack={() => setSelectedCompany(null)}
      />
    );
  }

  return (
    <CompanySelector onCompanySelect={(id, name) => setSelectedCompany({id, name})} />
  );
};

export default Reviewer;