export function calculateContextMenuPosition(event, containerRect) {
  return {
    top: event.clientY < containerRect.height - 200 && event.clientY,
    left: event.clientX < containerRect.width - 200 && event.clientX,
    right:
      event.clientX >= containerRect.width - 200 &&
      containerRect.width - event.clientX,
    bottom:
      event.clientY >= containerRect.height - 200 &&
      containerRect.height - event.clientY,
  };
}
