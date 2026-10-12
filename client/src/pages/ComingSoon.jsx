import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function ComingSoon({ icon, title }) {
  return (
    <Card>
      <EmptyState icon={icon} title={title} description="This feature is coming soon." />
    </Card>
  );
}
