import React from "react";

export const SkeletonLoader: React.FC = () => {
  const items = Array.from(Array(10).keys());

  const isFirst = (x: number) => x === items[0];
  const isLast = (x: number) => x === items.length - 1;

  return (
    <ul className="flex flex-col divide divide-y w-full rounded-lg bg-white">
      {items.map((x) => (
        <div
          key={x}
          className={`bg-white p-4 ring-1 ring-slate-900/5  shadow-lg w-full ${
            isFirst(x) ? "rounded-t-lg" : isLast(x) ? "rounded-b-lg" : ""
          }`}
        >
          <div className="flex space-x-4 animate-pulse w-full">
            <div className="rounded-full bg-slate-200 h-14 w-14"></div>
            <div className="flex-1 space-y-6 py-1 w-80">
              <div className="h-2 bg-slate-200 rounded-sm"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded-sm col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded-sm col-span-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </ul>
  );
};
