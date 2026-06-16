import Card from "@/components/Card";

export const metadata = { title: "Membership" };

export default function AdminMembershipsPage() {
  return (
    <Card>
      <div className="text-base font-semibold">Membership</div>
      <p className="mt-2 text-sm text-black/70">
        Secure viewing/export and filtering for membership submissions will be added here.
      </p>
    </Card>
  );
}
