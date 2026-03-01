import classNames from "classnames";
import { HTMLAttributes } from "react";

const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={classNames(
      "container mx-auto w-full bg-white rounded-lg shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default CardContent;
