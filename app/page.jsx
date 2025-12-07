'use client';

import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Home() {
  const { scrollY, scrollYProgress } = useScroll();

  // --- State to hold computed scroll values (SSR-safe) ---
  const [scrollStages, setScrollStages] = useState(null);

  useEffect(() => {
    const updateSizes = () => {
      const vh = window.innerHeight; // SAFE: inside useEffect
      
      // Your original vh-based offsets (in viewport heights)
      const targetVh = 1;
      const startOffsetVh = targetVh - 0.2;
      const endOffsetVh = targetVh + 0.2;
      const fadeOutEndVh = targetVh + 2.2;

      // Convert vh → px
      const stage5StartPx = startOffsetVh * vh;
      const stage5EndPx = endOffsetVh * vh;
      const fadeOutEndPx = fadeOutEndVh * vh;

      // Total scrollable pixels for progress calculation
      const total = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );

      // Convert px to normalized progress [0..1]
      const pxToProgress = (px) => Math.min(Math.max(px / total, 0), 1);

      setScrollStages({
        vh,
        stage5StartPx,
        stage5EndPx,
        fadeOutEndPx,
        stage5StartProg: pxToProgress(stage5StartPx),
        stage5EndProg: pxToProgress(stage5EndPx),
        stage5FadeOutProg: pxToProgress(fadeOutEndPx),
        total,
      });
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    const t = setTimeout(updateSizes, 500); // Re-calculate after fonts load

    return () => {
      window.removeEventListener('resize', updateSizes);
      clearTimeout(t);
    };
  }, []);

  // --- Define all hooks BEFORE any conditional returns ---
  // Use fixed fallback values (will be corrected when scrollStages loads)
  const vh = scrollStages?.vh ?? 800; // Safe fallback (no window access)
  const stage5StartProg = scrollStages?.stage5StartProg ?? 0.2;
  const stage5EndProg = scrollStages?.stage5EndProg ?? 0.3;
  const stage5FadeOutProg = scrollStages?.stage5FadeOutProg ?? 0.4;

  // --- Compute Stage 1 end progress dynamically ---
  const stage1EndPx = vh; // Stage 1 ends after 1 viewport height
  const totalScroll = scrollStages?.total ?? 19200; // total scrollable px (safe fallback)
  const stage1EndProgress = stage1EndPx / totalScroll;
  
  // Stage 5 animation starts earlier - at 0.5 viewport heights instead of 1
  const stage5StartPx = vh * 0.5;
  const stage5Start = stage5StartPx / totalScroll;
  const stage5Mid = stage5Start + 0.05;
  const stage5End = stage5Start + 0.10;

  // --- Scroll ranges for Tip text ---
  // Tip appears a bit later - at Stage 2.5
  const stage2_5EndPx = vh * 2.5;
  const tipStart = stage2_5EndPx / totalScroll;
  const tipMid = tipStart + 0.03;
  const tipEnd = tipStart + 0.12;

  // --- Scroll ranges for Familiar Feel text ---
  // Familiar Feel appears a bit later - at Stage 4.5
  const stage4_5EndPx = vh * 4.5;
  const familiarStart = stage4_5EndPx / totalScroll;
  const familiarMid = familiarStart + 0.03;
  const familiarEnd = familiarStart + 0.12;

  // --- Scroll ranges for Crafted With text ---
  // Crafted With appears after Familiar Feel - at Stage 7.5
  const stage7_5EndPx = vh * 7.5;
  const craftedStart = stage7_5EndPx / totalScroll;
  const craftedMid = craftedStart + 0.03;
  const craftedEnd = craftedStart + 0.12;

  // --- Map normalized progress to transforms ---
  const heroYRaw = useTransform(scrollYProgress, [0, 0.02], [0, -0.12]);
  const heroOpacityRaw = useTransform(scrollYProgress, [0, 0.02], [1, 0]);

  // Stage 5 transforms using dynamically calculated progress ranges
  const stage5YRaw = useTransform(
    scrollYProgress,
    [stage5Start, stage5Mid, stage5End],
    [1, 0.5, 0]
  );
  const stage5OpacityRaw = useTransform(
    scrollYProgress,
    [stage5Start, stage5Mid, stage5End],
    [0, 1, 0]
  );

  const stage5YPx = useTransform(stage5YRaw, (v) => v * vh);
  const stage5Transform = useMotionTemplate`translate(-50%, ${stage5YPx}px)`;

  // Tip text transforms
  const tipYRaw = useTransform(
    scrollYProgress,
    [tipStart, tipMid, tipEnd],
    [1, 0.5, 0]
  );
  const tipYPx = useTransform(tipYRaw, (v) => v * vh);
  const tipTransform = useMotionTemplate`translate(-50%, ${tipYPx}px)`;

  const tipOpacityRaw = useTransform(
    scrollYProgress,
    [tipStart, tipMid, tipEnd],
    [1, 1, 0]
  );

  // Familiar Feel transforms
  const familiarYRaw = useTransform(
    scrollYProgress,
    [familiarStart, familiarMid, familiarEnd],
    [1, 0.5, 0]
  );
  const familiarYPx = useTransform(familiarYRaw, (v) => v * vh);
  const familiarTransform = useMotionTemplate`translate(-50%, ${familiarYPx}px)`;

  const familiarOpacityRaw = useTransform(
    scrollYProgress,
    [familiarStart, familiarMid, familiarEnd],
    [0, 1, 0]
  );

  // Use springs for smoothness
  const springConfig = { stiffness: 400, damping: 60 };
  const heroY = useSpring(heroYRaw, springConfig);
  const heroOpacity = useSpring(heroOpacityRaw, springConfig);
  const stage5Y = useSpring(stage5YRaw, springConfig);
  const stage5Opacity = useSpring(stage5OpacityRaw, springConfig);
  const tipOpacity = useSpring(tipOpacityRaw, springConfig);
  const familiarOpacity = useSpring(familiarOpacityRaw, springConfig);

  // Crafted With transforms
  const craftedYRaw = useTransform(
    scrollYProgress,
    [craftedStart, craftedMid, craftedEnd],
    [1, 0.5, 0]
  );
  const craftedYPx = useTransform(craftedYRaw, (v) => v * vh);
  const craftedTransform = useMotionTemplate`translate(-50%, ${craftedYPx}px)`;

  const craftedOpacityRaw = useTransform(
    scrollYProgress,
    [craftedStart, craftedMid, craftedEnd],
    [0, 1, 0]
  );
  const craftedOpacity = useSpring(craftedOpacityRaw, springConfig);

  // Responsive font sizing with clamp
  const heroFontSize = 'clamp(72px, 14vw, 420px)';
  const heroLineHeight = 'clamp(64px, 12vw, 330px)';

  // Early return if not ready (after all hooks are called)
  if (!scrollStages) return null;
  return (
    <main style={{ height: '20000px', position: 'relative', background: '#000' }}>
      {/* fixed Spline scene */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <spline-viewer url="https://prod.spline.design/ABPK6hh8qjl9jvmL/scene.splinecode" />
      </div>

      {/* hero text */}
      <motion.div
        style={{
          position: 'fixed',
          top: '45%',
          left: '50%',
          zIndex: 10,
          pointerEvents: 'none',
          translateX: '-50%',
          translateY: '-50%',
          transform: `translate(-50%, -50%) translateY(${(-heroY.get() * vh * 100) || 0}px)`,
          opacity: heroOpacity,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontSize: heroFontSize,
            lineHeight: heroLineHeight,
            margin: 0,
            fontWeight: 400,
            fontFamily: "'Ori Scan 2.0', 'Lato', sans-serif",
            whiteSpace: 'nowrap',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transform: 'translateZ(0)',
            marginBottom: '80px',
          }}
        >
          <span style={{ color: '#ffffff' }}>Ori</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Scan 2.0</span>
        </h1>
        <p
          style={{
            color: 'white',
            fontSize: 'clamp(16px, 1.8vw, 32px)',
            marginTop: '24px',
            lineHeight: 1.4,
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          The Ori Tech Membership <span style={{ color: 'rgb(147,147,147)' }}>is the first-of-its-kind<br />
          technology subscription starting at</span> $549/mo.
        </p>
      </motion.div>

      {/* Stage 5 text - we convert fraction->px here */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          zIndex: 15,
          pointerEvents: 'none',
          transform: stage5Transform,
          opacity: stage5Opacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'white',
            fontSize: 'clamp(40px, 6vw, 85px)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.1,
            fontFamily: "'Ori Scan 2.0', 'Lato', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transform: 'translateZ(0)',
          }}
        >
          <span style={{ color: '#ffffff' }}>Half</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>the Cost.</span><br />
          <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Double the Value.</span>
        </p>
      </motion.div>

      {/* Tip text */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '50%',
          left: '50%',
          zIndex: 16,
          pointerEvents: 'none',
          transform: tipTransform,
          opacity: tipOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Ori Scan 2.0', 'Lato', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: 'white',
              fontSize: 'clamp(40px, 6vw, 85px)',
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.1,
              transform: 'translateZ(0)',
              marginBottom: '10rem',
            }}
          >
            <span style={{ color: '#ffffff' }}>Incredibly</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Compact</span>
          </p>
          
          <div style={{ display: 'flex', gap: '8rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <div>
              <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'rgb(147, 147, 147)', margin: 0, marginBottom: '0.25rem', fontWeight: 600 }}>Tip</p>
              <p style={{ fontSize: 'clamp(20px, 3vw, 32px)', color: 'rgb(147, 147, 147)', margin: 0 }}>3.85 inches</p>
            </div>
            <div>
              <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'rgb(147, 147, 147)', margin: 0, marginBottom: '0.25rem', fontWeight: 600 }}>Handle</p>
              <p style={{ fontSize: 'clamp(20px, 3vw, 32px)', color: 'rgb(147, 147, 147)', margin: 0 }}>5.25 inches</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Familiar Feel text */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '50%',
          right: '4rem',
          zIndex: 17,
          pointerEvents: 'none',
          transform: familiarTransform,
          opacity: familiarOpacity,
          textAlign: 'left',
          maxWidth: '500px',
        }}
      >
        <p
          style={{
            color: 'rgb(147, 147, 147)',
            fontSize: 'clamp(24px, 2.5vw, 32px)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.2,
            fontFamily: "'Lato', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transform: 'translateZ(0)',
            marginBottom: '0.75rem',
          }}
        >
          Familiar Feel
        </p>
        <p
          style={{
            color: 'white',
            fontSize: 'clamp(28px, 4vw, 56px)',
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "'Ori Scan 2.0', 'Lato', sans-serif",
          }}
        >
          <span style={{ display: 'block' }}>Similar in weight and</span>
          <span style={{ display: 'block' }}>feel to your handpiece</span>
          <span style={{ display: 'block' }}>instrument</span>
        </p>
      </motion.div>

      {/* Crafted With Section - Left Aligned */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '50%',
          left: '25rem',
          zIndex: 18,
          pointerEvents: 'none',
          transform: craftedTransform,
          opacity: craftedOpacity,
          textAlign: 'left',
          maxWidth: '500px',
        }}
      >
        <p
          style={{
            color: 'rgb(147, 147, 147)',
            fontSize: 'clamp(24px, 2.5vw, 32px)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.2,
            fontFamily: "'Lato', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transform: 'translateZ(0)',
            marginBottom: '0.75rem',
          }}
        >
          Crafted with
        </p>
        <p
          style={{
            color: 'white',
            fontSize: 'clamp(40px, 6vw, 85px)',
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "'Ori Scan 2.0', 'Lato', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          Aerospace Aluminum
        </p>
      </motion.div>

      {/* Bottom Center Text */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          zIndex: 5,
          pointerEvents: 'none',
          translateX: '-50%',
          opacity: heroOpacity,
        }}
      >
        <p style={{
          color: 'rgb(147, 147, 147)',
          fontSize: 'clamp(14px, 1.5vw, 18px)',
          lineHeight: 1.4,
          margin: 0,
          fontWeight: 'normal',
          maxWidth: '600px',
          textAlign: 'center'
        }}>No hidden fees and no financing needed.<br />Get Ori 2.0 and go digital in 30-days or less with your new membership.</p>
      </motion.div>

      {/* page content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem', color: '#fff' }}>
        {/* CTA Section with Buttons */}
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >Ori Scan</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >Comparison</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >Testimonial</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'rgb(147, 147, 147)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >About</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'rgb(147, 147, 147)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >New Revenue</motion.button>
        </div>
        
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>
            <div style={{ height: '100vh' }} />
          </div>
        ))}
      </div>
    </main>
  );
}
