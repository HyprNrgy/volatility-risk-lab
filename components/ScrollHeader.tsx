'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';

export default function ScrollHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header 
      className={`border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky z-50 top-8 ${className}`}
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.header>
  );
}
