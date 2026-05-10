import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/layout/page-layout";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stat?: string;
};

export function PageHeader({ eyebrow, title, description, icon: Icon, stat }: PageHeaderProps) {
  return (
    <PageHero eyebrow={eyebrow} title={title} description={description} icon={Icon} stat={stat} />
  );
}
