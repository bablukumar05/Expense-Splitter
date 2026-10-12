import { Link } from "react-router-dom";
import { buttonStyles } from "./button-styles";

export default function ButtonLink({ variant, size, fullWidth, className, ...props }) {
  return <Link className={buttonStyles({ variant, size, fullWidth, className })} {...props} />;
}
