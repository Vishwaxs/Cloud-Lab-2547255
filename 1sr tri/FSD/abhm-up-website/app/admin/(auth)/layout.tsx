export default function AdminAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-[70vh]">{children}</div>;
}
