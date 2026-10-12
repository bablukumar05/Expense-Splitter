import { forwardRef } from "react";
import Spinner from "./Spinner";
import { buttonStyles } from "./button-styles";

// type default "button": form ke andar galti se submit na ho. Submit ke liye type="submit" do.
const Button = forwardRef(function Button(
  { variant, size, loading = false, fullWidth = false, className, children, disabled, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
});

export default Button;
