import { redirect } from 'next/navigation';

export default async function PatientCarepathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/patients/${id}?tab=carepath`);
}
