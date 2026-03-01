import {
  Children,
  cloneElement,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefAttributes,
  SyntheticEvent,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import useDisableWindowScroll from "../../hooks/useDisableWindowScroll";
import DropdownList from "./DropdownList";
import DropdownListItem from "./DropdownListItem";
import styles from "./DropdownMenu.module.css";

const animationClassNames = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  exit: styles.exit,
  exitActive: styles.exitActive,
};

export interface DropdownMenuOption<Value = unknown> {
  label: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  value: Value;
  onSelect?: (event: SyntheticEvent<HTMLLIElement>) => void;
}

interface DropdownMenuProps<Option> {
  options: Option[];
  isOpen: boolean;
  onSelect?: (option: Option, event: SyntheticEvent<HTMLLIElement>) => void;
  onClose: (event: SyntheticEvent) => void;
  children: ReactElement;
  overlaySelectedOption?: boolean;
}

function DropdownMenu<Option extends DropdownMenuOption>({
  children,
  onClose,
  onSelect,
  options,
  isOpen,
  overlaySelectedOption,
}: DropdownMenuProps<Option>) {
  const anchorRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const firstSelectedOptionRef = useRef<HTMLLIElement | null>(null);
  const singleChild = cloneElement(
    Children.only(children) as ReactElement<RefAttributes<HTMLElement>>,
    {
      ref: anchorRef,
    }
  );
  const firstSelectedOptionIndex = options.findIndex(
    (option) => option.selected
  );
  const onBackdropClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!listRef.current?.contains(event.target as Node)) {
      onClose(event);
    }
  };
  /**
   * Make the main browser window unscrollable while open.
   */
  useDisableWindowScroll(isOpen);
  /**
   * Position the dropdown menu according to the child element.
   */
  useEffect(() => {
    const left = leftRef.current;
    const top = topRef.current;
    const anchor = anchorRef.current;
    const firstSelectedOption = firstSelectedOptionRef.current;
    if (anchor && left && top) {
      const position = anchor.getBoundingClientRect();
      left.style.maxWidth = `${position.left}px`;
      if (overlaySelectedOption) {
        // Try to position the first selected option just above the anchor element
        const firstSelectedOptionOffset = firstSelectedOption?.offsetTop ?? 0;
        const y = Math.max(position.top - firstSelectedOptionOffset, 0);
        top.style.maxHeight = `${y}px`;
      } else {
        // Position below the anchor element as a regular dropdown
        top.style.maxHeight = `${position.bottom}px`;
      }
    }
  });
  const dropdown = (
    <CSSTransition
      in={isOpen}
      timeout={100}
      classNames={animationClassNames}
      mountOnEnter
      unmountOnExit
    >
      <div className={styles.backdrop} onClick={onBackdropClick}>
        <div className={styles.leftFill} ref={leftRef} />
        <div className={styles.column}>
          <div className={styles.topFill} ref={topRef} />
          <DropdownList ref={listRef} className={styles.menu}>
            {options.map((option, index) => (
              <DropdownListItem
                key={JSON.stringify(option.value)}
                label={option.label}
                description={option.description}
                disabled={option.disabled}
                selected={option.selected}
                onClick={(event) => {
                  option.onSelect?.(event);
                  onSelect?.(option, event);
                }}
                ref={
                  index === firstSelectedOptionIndex
                    ? firstSelectedOptionRef
                    : null
                }
              />
            ))}
          </DropdownList>
          <div className={styles.bottomFill} />
        </div>
        <div className={styles.rightFill} />
      </div>
    </CSSTransition>
  );
  return (
    <>
      {dropdown && createPortal(dropdown, document.body)}
      {singleChild}
    </>
  );
}

export default DropdownMenu;
