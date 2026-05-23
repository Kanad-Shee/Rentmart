export function getDashboardRevealTransition(
  shouldReduceMotion: boolean,
  index = 0
) {
  if (shouldReduceMotion) {
    return {
      duration: 0,
      delay: 0
    };
  }

  return {
    duration: 0.42,
    delay: Math.min(index * 0.06, 0.42),
    ease: [0.22, 1, 0.36, 1] as const
  };
}

export function getDashboardRevealProps(
  shouldReduceMotion: boolean,
  index = 0
) {
  return {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 18
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: getDashboardRevealTransition(shouldReduceMotion, index)
  };
}
