import { redirect } from 'next/navigation';

export default async function PatientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/patients/${id}?tab=record-closeout`);
}
