import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { APP_NAME } from "@/lib/constants";

export default function InstallCard() {
  const { installed, canInstall, isIos, install } = useInstallPrompt();

  if (installed || (!canInstall && !isIos)) return null;

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted") toast.success("App installed");
  };

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Install the app</h2>
      {canInstall ? (
        <>
          <p className="text-sm text-muted">
            Add {APP_NAME} to your home screen for quick access and a full-screen experience.
          </p>
          <Button onClick={handleInstall}>
            <Download className="mr-1.5 size-4" /> Install app
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted">
          On iPhone or iPad, tap <Share2 className="inline size-4 align-text-bottom" aria-label="Share" /> Share in Safari, then choose &quot;Add to Home Screen&quot;.
        </p>
      )}
    </Card>
  );
}
