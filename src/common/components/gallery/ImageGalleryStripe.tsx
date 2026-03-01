import classNames from "classnames";
import { useCallback, useEffect, useRef, useState, FC } from "react";
import { CSSTransition } from "react-transition-group";
import ImageGalleryOverlay from "./ImageGalleryOverlay";
import styles from "./ImageGalleryStripe.module.css";
import { CSSTransitionClassNames } from "react-transition-group/CSSTransition";
import { ImageGalleryItem } from "./ImageGallerySwipeView";

interface ImageGalleryStripeProps {
  className?: string;
  images: ImageGalleryItem[];
}

const imageTransitionClassNames: CSSTransitionClassNames = {
  enterActive: styles.entering,
  enterDone: styles.entered,
};

const loadThreshold = 100;

function scrollIntoViewHorizontally(element?: HTMLElement | null): void {
  if (!element) return;
  const parent = element.parentElement;
  if (!parent) return;
  const { offsetLeft, clientWidth } = element;
  const { scrollLeft, clientWidth: parentClientWidth } = parent;
  if (offsetLeft < scrollLeft) {
    parent.scrollLeft = offsetLeft;
  } else if (offsetLeft + clientWidth > scrollLeft + parentClientWidth) {
    parent.scrollLeft = offsetLeft + clientWidth - parentClientWidth;
  }
}

const ImageGalleryStripe: FC<ImageGalleryStripeProps> = ({
  className,
  images,
}) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [renderCount, setRenderCount] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const sourceElementRef = useRef<HTMLImageElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onImageLoad = useCallback(() => {
    setVisibleCount((count) => count + 1);
  }, []);

  const checkLoadMore = useCallback(() => {
    const container = containerRef.current!;
    const placeholder = placeholderRef.current;
    if (placeholder) {
      const { scrollLeft, clientWidth } = container;
      const offsetLeft = placeholder?.offsetLeft ?? 0;
      if (scrollLeft + clientWidth + loadThreshold >= offsetLeft) {
        setRenderCount((count) => Math.max(count, visibleCount + 1));
      }
    }
  }, [visibleCount]);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (placeholder && visibleCount) {
      const estimatedImageWidth = placeholder.offsetLeft / visibleCount;
      const estimatedRemainingWidth =
        estimatedImageWidth * (images.length - visibleCount);
      placeholder.style.width = `${Math.ceil(estimatedRemainingWidth)}px`;
    }
    checkLoadMore();
    const container = containerRef.current!;
    container.addEventListener("scroll", checkLoadMore);
    window.addEventListener("resize", checkLoadMore);
    return () => {
      container.removeEventListener("scroll", checkLoadMore);
      window.removeEventListener("resize", checkLoadMore);
    };
  });

  return (
    <div
      className={classNames(
        "relative flex flex-row items-stretch h-40 space-x-0.5 overflow-x-auto",
        className
      )}
      ref={containerRef}
    >
      {images.slice(0, renderCount).map(({ src, title }, index) => (
        <CSSTransition
          in={index < visibleCount}
          key={src}
          timeout={150}
          classNames={imageTransitionClassNames}
        >
          <img
            className={styles.image}
            onLoad={onImageLoad}
            onError={onImageLoad}
            onClick={() => {
              setImageIndex(index);
              setIsOverlayOpen(true);
            }}
            src={src}
            alt={title}
            // Keep track of the image HTML element that is currently "active"
            ref={
              index !== imageIndex
                ? null
                : (imageElement) => {
                    sourceElementRef.current = imageElement;
                  }
            }
          />
        </CSSTransition>
      ))}
      {renderCount < images.length && (
        <div className="w-40 shrink-0" ref={placeholderRef} />
      )}
      <ImageGalleryOverlay
        images={images}
        index={imageIndex}
        onIndexChange={(newIndex) => {
          setImageIndex(newIndex);
          // Increase the render count as we navigate inside the overlay
          setRenderCount((count) => Math.max(count, newIndex));
          /**
           * Whenever an active image index changes, ensure that the HTML element
           * of the active image is visible on the scrollable container.
           */
          requestAnimationFrame(() => {
            scrollIntoViewHorizontally(sourceElementRef.current);
          });
        }}
        visible={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        sourceElementRef={sourceElementRef}
      />
    </div>
  );
};

export default ImageGalleryStripe;
