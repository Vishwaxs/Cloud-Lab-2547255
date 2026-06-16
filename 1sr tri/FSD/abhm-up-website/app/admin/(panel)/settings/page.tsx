import PageTitle from "@/components/PageTitle";
import SettingsForm from "./SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div>
      <PageTitle title="Site Settings" subtitle="Manage hero, contact info, and social links" tone="dark" />
      <SettingsForm />
    </div>
  );
}
