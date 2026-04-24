import { useRef, useState, useCallback } from "react";

/**
 * useSwipe — horizontal swipe detection for touch + mouse.
 *
 * Returns:
 *   - bind: spread onto the element you want to listen on
 *   - offsetX: live translation while the user is dragging (for feedback)
 *   - isDragging: boolean
 *
 * Config:
 *   - onSwipeLeft:  fired when user swipes LEFT past threshold (go to NEXT)
 *   - onSwipeRight: fired when user swipes RIGHT past threshold (go to PREV)
 *   - threshold:    pixels required to commit the swipe (default 70)
 *
 * We use Pointer Events rather than separate touch+mouse — they unify
 * across devices and are well supported on modern iOS / Android / desktop.
 */
export default function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 70,
}) {
  const startX = useRef(null);
  const startY = useRef(null);
  const pointerId = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    startX.current = null;
    startY.current = null;
    pointerId.current = null;
    setOffsetX(0);
    setIsDragging(false);
  }, []);

  const onPointerDown = (e) => {
    // Ignore right-click
    if (e.button !== undefined && e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    pointerId.current = e.pointerId;
    setIsDragging(true);
  };

  const onPointerMove = (e) => {
    if (pointerId.current !== e.pointerId || startX.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // If the motion is more vertical than horizontal, it's a scroll, not a swipe.
    // Bail out so the page can scroll naturally.
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      reset();
      return;
    }
    setOffsetX(dx);
  };

  const onPointerUp = (e) => {
    if (pointerId.current !== e.pointerId) return;
    const dx = offsetX;
    if (dx <= -threshold) onSwipeLeft?.();
    else if (dx >= threshold) onSwipeRight?.();
    reset();
  };

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: reset,
    onPointerLeave: (e) => {
      // If the user drags off the element, don't count it as a swipe
      if (isDragging) reset();
    },
    style: {
      transform: `translateX(${offsetX}px)`,
      transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)",
      touchAction: "pan-y", // let vertical scroll work; we own horizontal
    },
  };

  return { bind, offsetX, isDragging };
}
