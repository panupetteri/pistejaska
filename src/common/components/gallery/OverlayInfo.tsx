import classNames from "classnames";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { convertToLocaleDateString } from "../../dateUtils";

interface OverlayInfoProps {
  className?: string;
  title: string;
  date: Temporal.Instant;
  link: string;
}

const OverlayInfo: FC<OverlayInfoProps> = ({
  title,
  date,
  link,
  className,
}) => {
  return (
    <Link
      to={link}
      className={classNames(
        "absolute left-0 right-0 bottom-0 bg-black/60 hover:bg-black/70 flex flex-row items-center text-white text-xs py-1 px-2 cursor-pointer transition-background",
        className
      )}
    >
      <span className="block">{title}</span>
      <span className="block ml-auto">{convertToLocaleDateString(date)}</span>
    </Link>
  );
};

export default OverlayInfo;
