import classNames from "classnames";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

interface DropdownListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

const DropdownList = forwardRef<HTMLUListElement, DropdownListProps>(
  ({ className, children, ...props }, ref) => (
    <ul
      className={classNames(
        "relative shrink grow-0 min-w-fit overflow-y-auto overflow-x-hidden bg-white shadow-lg shadow-black/50 rounded-sm",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </ul>
  )
);

export default DropdownList;
