import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      closeButton
      toastOptions={{
        style: {
          background: "rgb(11 16 38 / 0.95)",
          color: "#e8ebf8",
          border: "1px solid rgb(255 255 255 / 0.1)",
          borderRadius: "16px",
        },
      }}
    />
  );
}
