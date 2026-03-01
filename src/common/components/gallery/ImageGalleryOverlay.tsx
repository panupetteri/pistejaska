import { RefObject, FC } from "react";
import OverlayCloseButton from "./OverlayCloseButton";
import OverlayInfo from "./OverlayInfo";
import OverlayModal from "./OverlayModal";
import ImageGallerySwipeView, {
  ImageGalleryItem,
} from "./ImageGallerySwipeView";
import { mapVirtualIdxToArrayIdx } from "./utils";

interface ImageGalleryOverlayProps {
  visible: boolean;
  onClose: () => void;
  images: ImageGalleryItem[];
  index: number;
  onIndexChange: (index: number) => void;
  sourceElementRef?: RefObject<HTMLElement | null>;
}

const ImageGalleryOverlay: FC<ImageGalleryOverlayProps> = ({
  images,
  index,
  onIndexChange,
  visible,
  onClose,
  sourceElementRef,
}) => {
  const idx = mapVirtualIdxToArrayIdx(index, images.length);
  const image = images[idx];
  return (
    <OverlayModal
      visible={visible}
      sourceElementRef={sourceElementRef}
      onClose={onClose}
      controls={
        <>
          <OverlayCloseButton
            onClick={onClose}
            className="absolute top-1 right-1"
          />
          {image && (
            <OverlayInfo
              title={image.title}
              date={image.date}
              link={image.link}
            />
          )}
        </>
      }
    >
      <ImageGallerySwipeView
        images={images}
        index={index}
        onIndexChange={onIndexChange}
      />
    </OverlayModal>
  );
};

export default ImageGalleryOverlay;
