import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function ComingSoon({ icon, title, part }) {
  return (
    <Card>
      <EmptyState icon={icon} title={title} description={`This tab is built in Part ${part}.`} />
    </Card>
  );
}
