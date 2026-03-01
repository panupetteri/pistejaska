import classNames from "classnames";
import { HTMLAttributes } from "react";

const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={classNames(
      "container bg-slate-100 shadow-sm rounded-xl mb-4 p-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
