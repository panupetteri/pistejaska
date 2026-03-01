import { FC, ReactNode, RefObject, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import useDisableWindowScroll from "../../hooks/useDisableWindowScroll";
import useKeyPressHandler from "../../hooks/useKeyPressHandler";

interface OverlayModalProps {
  visible: boolean;
  sourceElementRef?: RefObject<HTMLElement | null>;
  onClose?: () => void;
  controls?: ReactNode;
  children?: React.ReactNode;
}

/**
 * Calculates a transform for a full-sized element so that it
 * seems to be placed at the top of the source bounding client rectangle
 * and have approximately the same size.
 */
function getContentShrinkTransform(sourceRect?: DOMRect | null) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const sourceWidth = sourceRect?.width ?? windowWidth;
  const sourceHeight = sourceRect?.height ?? windowHeight;
  const sourceLeft = sourceRect?.left ?? 0;
  const sourceTop = sourceRect?.top ?? 0;
  const deltaX = sourceLeft + sourceWidth / 2 - windowWidth / 2;
  const deltaY = sourceTop + sourceHeight / 2 - windowHeight / 2;
  const scaleX = sourceWidth / windowWidth;
  const scaleY = sourceHeight / windowHeight;
  const scale = Math.max(scaleX, scaleY);
  return `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
}

const OverlayModal: FC<OverlayModalProps> = ({
  visible,
  sourceElementRef,
  children,
  onClose,
  controls,
}) => {
  const innerOverlayRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  useDisableWindowScroll(visible);
  useKeyPressHandler("keydown", "Escape", onClose);

  const setElementOutStyles = useCallback(() => {
    backgroundRef.current!.style.opacity = "0";
    // NOTE: Calling getBoundingClientRect here will force a redraw,
    // which messes up the enter transition animation. Therefore
    // the `onEntering` callback needs to use `setTimeout`
    innerOverlayRef.current!.style.transform = getContentShrinkTransform(
      sourceElementRef?.current?.getBoundingClientRect()
    );
  }, [sourceElementRef]);

  const setElementInStyles = useCallback(() => {
    backgroundRef.current!.style.opacity = "1";
    innerOverlayRef.current!.style.transform = "translate(0, 0) scale(1)";
  }, []);

  const onEntering = useCallback(() => {
    // NOTE: `setTimeout` is needed because we forced a redraw with
    // `getBoundingClientRect` on `onEnter` callback.
    setTimeout(setElementInStyles, 0);
  }, [setElementInStyles]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const element = (
    <CSSTransition
      nodeRef={containerRef}
      in={visible}
      mountOnEnter
      unmountOnExit
      timeout={150}
      onEnter={setElementOutStyles}
      onEntering={onEntering}
      onExit={setElementInStyles}
      onExiting={setElementOutStyles}
    >
      <div
        className="fixed inset-0 z-10 transition-opacity bg-gray-900/90 backdrop-blur-lg"
        ref={containerRef}
      >
        <div
          className="fixed inset-0 z-10"
          style={{ pointerEvents: "none" }}
          ref={backgroundRef}
        />
        <div
          className="absolute inset-0 transition-transform flex flex-col items-center justify-center"
          ref={innerOverlayRef}
        >
          {children}
        </div>
        {controls}
      </div>
    </CSSTransition>
  );
  return createPortal(element, document.body);
};

export default OverlayModal;
