import { FC } from "react";

import { Temporal } from "@js-temporal/polyfill";
import { mapVirtualIdxToArrayIdx } from "./utils";
import SwipeableViews from "../../../lib/react-swipeable-views/src";
import { virtualize } from "../../../lib/react-swipeable-views-utils/src";
import { useHotkeys } from "react-hotkeys-hook";

const BindKeyboardSwipeableViews = virtualize(SwipeableViews);

export interface ImageGalleryItem {
  src: string;
  date: Temporal.Instant;
  title: string;
  link: string;
}

interface ImageGallerySwipeViewProps {
  images: ImageGalleryItem[];
  index: number;
  onIndexChange: (newIndex: number) => void;
}

const swipeableContainerStyle = { width: "100%", height: "100%" };

const slideRenderer = (images: ImageGalleryItem[], index: number) => {
  const idx = mapVirtualIdxToArrayIdx(index, images.length);
  const img = images[idx];

  return (
    <div key={index} className="w-full h-full flex justify-center items-center">
      <img
        className="max-w-full max-h-full shadow-lg object-contain"
        src={img.src}
        alt={img.title}
      />
    </div>
  );
};

const ImageGallerySwipeView: FC<ImageGallerySwipeViewProps> = ({
  images,
  index,
  onIndexChange,
}) => {
  useHotkeys(["left", "j"], () => onIndexChange(index - 1));
  useHotkeys(["right", "k"], () => onIndexChange(index + 1));

  return (
    <BindKeyboardSwipeableViews
      containerStyle={swipeableContainerStyle}
      className="cursor-pointer no-select"
      index={index}
      onClick={() => onIndexChange(index + 1)}
      onChangeIndex={onIndexChange}
      slideRenderer={({ index }: { index: number }) =>
        slideRenderer(images, index)
      }
    ></BindKeyboardSwipeableViews>
  );
};

export default ImageGallerySwipeView;
