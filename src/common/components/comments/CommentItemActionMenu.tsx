import { ReactElement, FC } from "react";
import DropdownMenu from "../dropdowns/DropdownMenu";

interface CommentItemActionMenuProps {
  children: ReactElement;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (() => void) | null;
}

const CommentItemActionMenu: FC<CommentItemActionMenuProps> = ({
  isOpen,
  onClose,
  children,
  onDelete,
}) => {
  return (
    <DropdownMenu
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onClose}
      options={[
        {
          label: "Delete",
          value: "delete",
          disabled: onDelete == null,
          onSelect: onDelete ?? undefined,
        },
      ]}
    >
      {children}
    </DropdownMenu>
  );
};

export default CommentItemActionMenu;
