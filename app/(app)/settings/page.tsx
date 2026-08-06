import { SettingsCommandClient } from '@/components/settings/settings-command-client';
import { settingsCategories } from '@/lib/services/operational-page-service';

export default function SettingsPage() {
  return <SettingsCommandClient categories={settingsCategories} />;
}
