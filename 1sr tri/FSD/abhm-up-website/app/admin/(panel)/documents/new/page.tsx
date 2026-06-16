import DocumentForm from "../DocumentForm";

export const metadata = { title: "Create Document" };

export default function AdminDocumentNewPage() {
  return <DocumentForm mode="create" />;
}
