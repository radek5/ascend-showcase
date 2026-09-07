import { requireVerifiedApplicantUser } from "@/lib/applicants/auth";

import Lagos2027StartApplicationForm from "./StartApplicationForm";

export default async function Lagos2027StartApplicationPage() {
  const applicantUser = await requireVerifiedApplicantUser();

  return <Lagos2027StartApplicationForm accountEmail={applicantUser.email} />;
}
