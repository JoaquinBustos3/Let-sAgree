export function stopPropagationProps() {
  return {
    onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
    onMouseUp: (e: React.SyntheticEvent) => e.stopPropagation(),
    onTouchStart: (e: React.SyntheticEvent) => e.stopPropagation(),
    onTouchEnd: (e: React.SyntheticEvent) => e.stopPropagation(),
  };
}