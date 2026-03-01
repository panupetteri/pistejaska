import { Temporal } from "@js-temporal/polyfill";
import classNames from "classnames";
import { useCallback, useState, FC } from "react";
import { convertToLocaleTimeString } from "../../dateUtils";
import useLongPress from "../../hooks/useLongPress";
import { containsJustEmojis } from "../../stringUtils";
import Markdown from "../Markdown";
import CommentItemActionMenu from "./CommentItemActionMenu";

interface CommentItemProps {
  children: string;
  date: Temporal.Instant;
  onDelete: (() => void) | null;
  key: string | number;
}

const actionMenuIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 29.96 122.88"
    className="w-3/6 h-3/6"
  >
    <path
      fill="currentColor"
      d="M15,0A15,15,0,1,1,0,15,15,15,0,0,1,15,0Zm0,92.93a15,15,0,1,1-15,15,15,15,0,0,1,15-15Zm0-46.47a15,15,0,1,1-15,15,15,15,0,0,1,15-15Z"
    />
  </svg>
);

const CommentItem: FC<CommentItemProps> = ({ children, date, onDelete }) => {
  const [dropdownState, setDropdownState] = useState<null | "bubble" | "icon">(
    null
  );
  const openIconDropdown = useCallback(() => setDropdownState("icon"), []);
  const openBubbleDropdown = useCallback(() => setDropdownState("bubble"), []);
  const closeDropdown = useCallback(() => setDropdownState(null), []);
  const [isPressing, longPressEventHandlers] =
    useLongPress<HTMLDivElement>(openBubbleDropdown);
  const justEmojis = containsJustEmojis(children);
  return (
    <div className="flex flex-row items-center group">
      <CommentItemActionMenu
        isOpen={dropdownState === "bubble"}
        onClose={closeDropdown}
        onDelete={onDelete}
      >
        <div
          className={classNames(
            "py-2 px-3 flex flex-row items-end gap-x-3 rounded-l rounded-r-2xl group-first:rounded-tl-2xl group-last:rounded-bl-2xl transition shadow-sm",
            justEmojis ? "text-3xl" : "text-sm",
            isPressing || dropdownState === "bubble"
              ? "bg-gray-200"
              : "bg-white"
          )}
          data-tooltip-content={date.toLocaleString()}
          data-tooltip-delay-show={500}
          data-tooltip-hidden={dropdownState != null}
          {...longPressEventHandlers}
        >
          <Markdown className="grow">{children}</Markdown>
          <div className="grow-0 shrink-0 text-xs leading-5 text-slate-300">
            {convertToLocaleTimeString(date, { timeStyle: "short" })}
          </div>
        </div>
      </CommentItemActionMenu>
      <CommentItemActionMenu
        isOpen={dropdownState === "icon"}
        onClose={closeDropdown}
        onDelete={onDelete}
      >
        <button
          className={classNames(
            "ml-2 hover:text-slate-500 hover:bg-gray-200 w-7 h-7 flex items-center justify-center cursor-pointer rounded-full shrink-0 grow-0 group-hover:visible",
            dropdownState === "icon"
              ? "visible text-slate-500 bg-gray-200"
              : "invisible text-slate-300"
          )}
          onClick={openIconDropdown}
        >
          {actionMenuIcon}
        </button>
      </CommentItemActionMenu>
    </div>
  );
};

export default CommentItem;
