import { permanentRedirect } from 'next/navigation';

export default function SecurityLogsPage() {
  permanentRedirect('/audit-logs');
}
