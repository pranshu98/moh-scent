import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AnimationControls, useAnimation } from 'framer-motion';

// Common animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const slideLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const scale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

interface UseAnimationOnScrollProps {
  threshold?: number;
  triggerOnce?: boolean;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  duration?: number;
}

export const useAnimationOnScroll = ({
  threshold = 0.1,
  triggerOnce = true,
  variant = 'fadeIn',
  delay = 0,
  duration = 0.5,
}: UseAnimationOnScrollProps = {}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [controls, inView, triggerOnce]);

  const getVariant = () => {
    switch (variant) {
      case 'slideUp':
        return slideUp;
      case 'slideDown':
        return slideDown;
      case 'slideLeft':
        return slideLeft;
      case 'slideRight':
        return slideRight;
      case 'scale':
        return scale;
      default:
        return fadeIn;
    }
  };

  const animationProps = {
    initial: 'hidden',
    animate: controls,
    variants: getVariant(),
    transition: { duration, delay },
  };

  return { ref, animationProps, inView };
};

interface UseSequentialAnimationProps {
  items: any[];
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
}

export const useSequentialAnimation = ({
  items,
  staggerDelay = 0.1,
  initialDelay = 0,
  duration = 0.5,
}: UseSequentialAnimationProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start((i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: initialDelay + i * staggerDelay,
          duration,
        },
      }));
    }
  }, [controls, inView, items.length, initialDelay, staggerDelay, duration]);

  const itemAnimation = (index: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: controls,
    custom: index,
  });

  return { ref, itemAnimation };
};

interface UsePulseAnimationProps {
  duration?: number;
  scale?: number;
}

export const usePulseAnimation = ({
  duration = 2,
  scale = 1.05,
}: UsePulseAnimationProps = {}) => {
  const pulseVariants = {
    pulse: {
      scale: [1, scale, 1],
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return { variants: pulseVariants, animate: 'pulse' };
};

interface UseHoverAnimationProps {
  scale?: number;
  duration?: number;
}

export const useHoverAnimation = ({
  scale = 1.05,
  duration = 0.2,
}: UseHoverAnimationProps = {}) => {
  const hoverVariants = {
    initial: { scale: 1 },
    hover: { scale },
  };

  const hoverProps = {
    variants: hoverVariants,
    initial: 'initial',
    whileHover: 'hover',
    transition: { duration },
  };

  return hoverProps;
};

export const usePageTransition = () => {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    enter: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return pageVariants;
};

export default {
  useAnimationOnScroll,
  useSequentialAnimation,
  usePulseAnimation,
  useHoverAnimation,
  usePageTransition,
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scale,
};
