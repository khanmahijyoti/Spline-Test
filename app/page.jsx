'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const Spline = dynamic(
  () => import('@splinetool/react-spline').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div style={{ height: '100vh', background: '#000' }} />,
  }
);

export default function Home() {
  const splineRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // --- CONFIGURATION ---
  const SPLINE_MAX_STEP = 221;
  const INITIAL_PAGE_HEIGHT_MULTIPLIER = 50;

  // --- STATE ---
  const [vh, setVh] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [debug, setDebug] = useState({ x: 0, y: 0, z: 0 });
  const [barProgress, setBarProgress] = useState(0);
  const smoothProgressRef = useRef(0);
  const smoothScrollRef = useRef(0);
  const lastSequenceIndexRef = useRef(0);

  // Full animation sequence - all 86 positions
  const ANIMATION_SEQUENCE = [
    { x: 194.01, y: 636.84, z: 26.73 },
    { x: 196.75, y: 639.07, z: 21.2 },
    { x: 205.4, y: 646.09, z: 3.8 },
    { x: 254.21, y: 685.75, z: -94.43 },
    { x: 272.95, y: 700.98, z: -132.14 },
    { x: 274.6, y: 701.84, z: -131.9 },
    { x: 282.52, y: 701.84, z: -100.24 },
    { x: 282.99, y: 701.84, z: -98.35 },
    { x: 277.98, y: 717.29, z: -118.75 },
    { x: 275.61, y: 724.57, z: -128.4 },
    { x: 263.53, y: 761.66, z: -177.57 },
    { x: 252.82, y: 791.49, z: -200.96 },
    { x: 251.26, y: 794.09, z: -192.92 },
    { x: 245.03, y: 804.47, z: -160.76 },
    { x: 241.92, y: 809.66, z: -144.69 },
    { x: 235.69, y: 820.05, z: -112.53 },
    { x: 235.52, y: 820.84, z: -111.2 },
    { x: 237.69, y: 820.84, z: -119.11 },
    { x: 240.3, y: 820.84, z: -128.64 },
    { x: 243.62, y: 820.84, z: -140.72 },
    { x: 250.4, y: 820.84, z: -165.45 },
    { x: 252.87, y: 820.84, z: -174.46 },
    { x: 255, y: 820.84, z: -182.22 },
    { x: 255.6, y: 820.84, z: -197.05 },
    { x: 256, y: 820.84, z: -207.13 },
    { x: 254.38, y: 820, z: -209.31 },
    { x: 250.91, y: 818.21, z: -213.65 },
    { x: 210.38, y: 797.31, z: -264.31 },
    { x: 203.31, y: 794.44, z: -271.08 },
    { x: 202.53, y: 794.91, z: -269.74 },
    { x: 199.95, y: 796.43, z: -265.36 },
    { x: 189.8, y: 802.45, z: -248.09 },
    { x: 176.21, y: 810.49, z: -224.99 },
    { x: 155.1, y: 822.99, z: -189.09 },
    { x: 83.33, y: 865.48, z: -67.04 },
    { x: 71.36, y: 872.57, z: -46.67 },
    { x: 51.2, y: 884.51, z: -12.4 },
    { x: 51.98, y: 885.05, z: -10.14 },
    { x: 61.15, y: 887.82, z: 3.4 },
    { x: 64.54, y: 888.84, z: 8.42 },
    { x: 79.46, y: 893.34, z: 30.45 },
    { x: 114.88, y: 904.03, z: 82.79 },
    { x: 148, y: 914.02, z: 131.73 },
    { x: 146.7, y: 912.06, z: 131.73 },
    { x: 146.13, y: 911.21, z: 131.73 },
    { x: 141.83, y: 911.03, z: 131.43 },
    { x: 134.75, y: 911.03, z: 130.93 },
    { x: 132.15, y: 911.03, z: 130.74 },
    { x: 126.18, y: 906.36, z: 129.1 },
    { x: 118.17, y: 899.96, z: 126.86 },
    { x: 110.85, y: 894.11, z: 124.81 },
    { x: 107.29, y: 891.25, z: 123.81 },
    { x: 107.01, y: 891.03, z: 86.53 },
    { x: 107.01, y: 891.03, z: 64.74 },
    { x: 107.01, y: 891.03, z: 39.62 },
    { x: 107.01, y: 891.03, z: -69.51 },
    { x: 107.01, y: 891.03, z: -71.27 },
    { x: 152.42, y: 858.01, z: -178.6 },
    { x: 184.72, y: 834.51, z: -254.96 },
    { x: 199.29, y: 823.92, z: -289.38 },
    { x: 224.75, y: 802.34, z: -355.1 },
    { x: 178.67, y: 792.61, z: -324.38 },
    { x: 156.59, y: 787.95, z: -309.65 },
    { x: 138.01, y: 784.03, z: -297.27 },
    { x: 138.01, y: 766.93, z: -262.61 },
    { x: 138.01, y: 696.6, z: -120.06 },
    { x: 138.01, y: 648.92, z: -23.43 },
    { x: 141.82, y: 633.19, z: 4.73 },
    { x: 151.78, y: 628.38, z: 4.73 },
    { x: 187.28, y: 611.24, z: 4.73 },
    { x: 194.57, y: 607.73, z: 4.73 },
    { x: 176.58, y: 607.03, z: 7.07 },
    { x: 165.58, y: 607.03, z: 8.4 },
    { x: 131.85, y: 607.03, z: 12.72 },
    { x: 95.28, y: 607.03, z: 18.62 },
    { x: 76.01, y: 607.03, z: 21.73 },
    { x: 100.62, y: 624.87, z: 54.95 },
    { x: 107.47, y: 629.84, z: 64.2 },
    { x: 115.3, y: 635.51, z: 74.77 },
    { x: 131.9, y: 675.96, z: -4.23 },
    { x: 155.94, y: 736.36, z: -125.19 },
    { x: 164.65, y: 758.24, z: -169.01 },
    { x: 171.15, y: 774.58, z: -201.73 },
    { x: 179.39, y: 795.29, z: -243.19 },
    { x: 183.86, y: 806.5, z: -265.64 },
    { x: 184.4, y: 807.87, z: -268.39 }
  ];

  // 1. Initialize: Set up initial page height before scene loads
  useEffect(() => {
    const initialize = () => {
      const vh = window.innerHeight;
      const initialHeight = vh * INITIAL_PAGE_HEIGHT_MULTIPLIER;
      
      document.body.style.height = `${initialHeight}px`;
      document.body.style.minHeight = `${initialHeight}px`;
      
      setVh(vh);
      setPageHeight(initialHeight);
      
      // Reset progress tracking
      smoothProgressRef.current = 0;
      setBarProgress(0);
      
      console.log('🔧 Page height initialized');
      console.log(`Initial page height: ${(initialHeight / 1000).toFixed(1)}k px`);
    };
    
    initialize();
    window.addEventListener('resize', initialize);
    return () => window.removeEventListener('resize', initialize);
  }, []);

  // 2. Sprung Scroll (Smoothed input for TEXT)
  const sprungScroll = useSpring(scrollYProgress, { 
    stiffness: 70,
    damping: 30
  });

  // 3. Track Ori Position and Map to Sequence
  useEffect(() => {
    const MAX_JUMP_THRESHOLD = 5; // Maximum allowed jump in sequence indices
    
    const trackOriPosition = () => {
      if (!splineRef.current) {
        requestAnimationFrame(trackOriPosition);
        return;
      }
      
      // Get ori object's ACTUAL position from Spline
      const ori = splineRef.current.findObjectByName("ori");
      if (!ori) {
        requestAnimationFrame(trackOriPosition);
        return;
      }
      
      const currentPos = {
        x: ori.position.x,
        y: ori.position.y,
        z: ori.position.z
      };
      
      setDebug(currentPos);
      
      // Find CLOSEST position in the 86-position sequence
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      for (let i = 0; i < ANIMATION_SEQUENCE.length; i++) {
        const seqPos = ANIMATION_SEQUENCE[i];
        const distance = Math.sqrt(
          Math.pow(currentPos.x - seqPos.x, 2) +
          Math.pow(currentPos.y - seqPos.y, 2) +
          Math.pow(currentPos.z - seqPos.z, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
      
      // Check if the jump is too large compared to last sequence index
      const indexDifference = Math.abs(closestIndex - lastSequenceIndexRef.current);
      
      // If jump is too large, ignore this update
      if (indexDifference > MAX_JUMP_THRESHOLD && lastSequenceIndexRef.current !== 0) {
        requestAnimationFrame(trackOriPosition);
        return;
      }
      
      // Update sequence index based on coordinate matching
      lastSequenceIndexRef.current = closestIndex;
      
      // Progress bar follows the SEQUENCE position (based purely on Ori coordinates)
      const targetProgress = closestIndex / (ANIMATION_SEQUENCE.length - 1);
      smoothProgressRef.current += (targetProgress - smoothProgressRef.current) * 0.15;
      setBarProgress(smoothProgressRef.current);
      
      // Sync scrollbar position with smooth damping (reduces erratic movement)
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const targetScroll = maxScroll * targetProgress;
      smoothScrollRef.current += (targetScroll - smoothScrollRef.current) * 0.1; // Damping factor 0.1
      window.scrollTo(0, smoothScrollRef.current);
      
      requestAnimationFrame(trackOriPosition);
    };
    
    trackOriPosition();
  }, []);

  // 4. Dynamic Range Calculator for text animations
  const useSyncedTransform = (startProgress, endProgress, fromBottom = false, exitToTop = false) => {
    const yDist = vh ? vh * -0.8 : -500;
    const startY = fromBottom ? (vh ? vh * 0.8 : 500) : 0;
    const endY = exitToTop ? (vh ? -vh * 0.8 : -500) : (fromBottom ? 0 : yDist);
    const y = useTransform(sprungScroll, [startProgress, endProgress], [startY, endY]);
    
    const mid = startProgress + (endProgress - startProgress) / 2;
    const opacity = useTransform(sprungScroll, [startProgress, mid, endProgress], [0, 1, 0]);
    
    return { y, opacity };
  };

  // --- ANIMATION DEFINITIONS (based on scroll progress 0-1) ---
  const stage5Anim = useSyncedTransform(0.05, 0.15, true, true); 
  const tipAnim = useSyncedTransform(0.20, 0.30, true, true); 
  const familiarAnim = useSyncedTransform(0.35, 0.45, true, true); 
  const craftedAnim = useSyncedTransform(0.50, 0.60, true, true); 
  const lightweightAnim = useSyncedTransform(0.65, 0.75, true, true); 
  const oriPhaseAnim = useSyncedTransform(0.80, 0.90, true, true);

  const heroY = useTransform(sprungScroll, [0, 0.05], [0, vh ? -vh * 0.6 : -500]); 
  const heroOpacity = useTransform(sprungScroll, [0, 0.05], [1, 0]);
  const ctaOpacity = useTransform(sprungScroll, [0, 0.01], [1, 0]);

  function onLoad(splineApp) {
    splineRef.current = splineApp;
    console.log('🎨 Spline loaded');
  }

  // Position debug display
  useEffect(() => {
    const update = () => {
      const ori = splineRef.current?.findObjectByName("ori");
      if (ori) {
        setDebug({ x: ori.position.x, y: ori.position.y, z: ori.position.z });
      }
      requestAnimationFrame(update);
    };
    update();
  }, []);

  // --- STYLES ---
  const textContainerStyle = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: 10,
  };

  const styles = {
    h1: {
        color: 'white',
        fontSize: 'clamp(100px, 12vw, 200px)',
        lineHeight: 1.1,
        margin: 0,
        fontWeight: 400,
        fontFamily: "'Ori Scan 2.0', 'Lato', sans-serif",
        whiteSpace: 'nowrap',
    },
    h2: {
        color: 'white', 
        fontSize: 'clamp(50px, 6vw, 110px)',
        fontWeight: 600, 
        margin: 0, 
        lineHeight: 1.1
    },
    p_label: {
        color: 'rgb(147, 147, 147)', 
        fontSize: 'clamp(18px, 2vw, 32px)',
        fontWeight: 600, 
        marginBottom: '0.5rem'
    },
    p_body: {
        color: 'white', 
        fontSize: 'clamp(24px, 3vw, 50px)',
        fontWeight: 400, 
        lineHeight: 1.4
    }
  };

  return (
    <main style={{ height: '100%', position: 'relative', background: '#000' }}>
      
      {/* 3D Scene */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Spline 
          scene="https://prod.spline.design/ABPK6hh8qjl9jvmL/scene.splinecode" 
          onLoad={onLoad} 
        />
      </div>

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        zIndex: 9998,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        display: 'none'
      }}>
        <div style={{
          height: '100%',
          width: `${barProgress * 100}%`,
          background: 'linear-gradient(90deg, #00d4ff, #0099ff)',
          borderRadius: '4px',
          transition: 'width 0.1s ease-out',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
        }} />
      </div>

      {/* Debug Display */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        left: 10, 
        color: 'white', 
        zIndex: 9999, 
        fontSize: '13px', 
        fontFamily: 'monospace', 
        background: 'rgba(0, 0, 0, 0.85)', 
        padding: '12px', 
        borderRadius: '6px',
        border: '2px solid #fbbf24',
        display: 'none'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Current Position:</strong><br />
          X: {debug.x.toFixed(2)}<br />
          Y: {debug.y.toFixed(2)}<br />
          Z: {debug.z.toFixed(2)}
        </div>

        <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
          <strong>Sequence:</strong> {lastSequenceIndexRef.current + 1}/86<br />
          <strong>Progress:</strong> {(barProgress * 100).toFixed(1)}%
        </div>
      </div>

      {/* --- HERO TEXT --- */}
      <motion.div style={{...textContainerStyle, paddingTop: 'clamp(80px, 15vw, 180px)'}}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, textAlign: 'center' }}>
          <h1 style={{...styles.h1, fontSize: 'clamp(120px, 14vw, 220px)'}}>
            <span style={{ color: '#ffffff' }}>Ori</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Scan</span> <span style={{ color: 'rgb(147, 147, 147)' }}>2.0</span>
          </h1>
          <p style={{ color: 'white', fontSize: 'clamp(20px, 2vw, 36px)', marginTop: 'clamp(24px, 3vw, 40px)', lineHeight: 1.4, maxWidth: '800px', marginInline: 'auto', paddingInline: '1rem' }}>
            The Ori Tech Membership <span style={{ color: 'rgb(147,147,147)' }}>is the first-of-its-kind<br />technology subscription starting at</span> $549/mo.
          </p>
          <p style={{ color: 'rgb(147, 147, 147)', fontSize: 'clamp(14px, 1.3vw, 20px)', marginTop: 'clamp(40px, 8vw, 250px)', lineHeight: 1.6, maxWidth: '700px', marginInline: 'auto', opacity: 0.9, paddingInline: '1rem' }}>
            No hidden fees and no financing needed.<br />
            Get Ori 2.0 and go digital in 30-days or less with your new membership.
          </p>
        </motion.div>
      </motion.div>

      {/* --- STAGE 5 --- */}
      <motion.div style={{...textContainerStyle, zIndex: 15}}>
        <motion.div style={{ y: stage5Anim.y, opacity: stage5Anim.opacity, textAlign: 'center' }}>
          <p style={styles.h2}>
            <span style={{ color: '#ffffff' }}>Half</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>the Cost.</span><br />
            <span style={{ color: '#ffffff' }}>Double</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>the Value.</span>
          </p>
        </motion.div>
      </motion.div>

      {/* --- TIP TEXT --- */}
      <motion.div style={{...textContainerStyle, zIndex: 16}}>
        <motion.div style={{ y: tipAnim.y, opacity: tipAnim.opacity, textAlign: 'center' }}>
          <p style={{ ...styles.h2, marginBottom: '10rem' }}>
            <span style={{ color: '#ffffff' }}>Incredibly</span> <span style={{ background: 'linear-gradient(to right, #ffffff, #909090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Compact</span>
          </p>
          <div style={{ display: 'flex', gap: '8rem', justifyContent: 'center' }}>
            <div>
              <p style={styles.p_label}>Tip</p>
              <p style={styles.p_body}>3.85 inches</p>
            </div>
            <div>
              <p style={styles.p_label}>Handle</p>
              <p style={styles.p_body}>5.25 inches</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* --- FAMILIAR FEEL --- */}
      <motion.div style={{ ...textContainerStyle, justifyContent: 'flex-end', paddingRight: '10vw', zIndex: 17 }}>
        <motion.div style={{ y: familiarAnim.y, opacity: familiarAnim.opacity, textAlign: 'left', maxWidth: '500px' }}>
          <p style={styles.p_label}>Familiar Feel</p>
          <p style={styles.p_body}>
            Similar in weight and<br />feel to your handpiece<br />instrument
          </p>
        </motion.div>
      </motion.div>

      {/* --- CRAFTED WITH --- */}
      <motion.div style={{ ...textContainerStyle, justifyContent: 'flex-start', paddingLeft: '15vw', zIndex: 18 }}>
        <motion.div style={{ y: craftedAnim.y, opacity: craftedAnim.opacity, textAlign: 'left', maxWidth: '500px' }}>
          <p style={styles.p_label}>Crafted with</p>
          <p style={styles.p_body}>Aerospace Aluminum</p>
        </motion.div>
      </motion.div>

      {/* --- LIGHTWEIGHT --- */}
      <motion.div style={{ ...textContainerStyle, justifyContent: 'flex-end', paddingRight: '15vw', zIndex: 19 }}>
        <motion.div style={{ y: lightweightAnim.y, opacity: lightweightAnim.opacity, textAlign: 'left', maxWidth: '500px' }}>
          <p style={styles.p_label}>Extremely Lightweight</p>
          <p style={styles.p_body}>144 grams</p>
        </motion.div>
      </motion.div>

      {/* --- ORI PHASE LOGIC --- */}
      <motion.div style={{ ...textContainerStyle, justifyContent: 'flex-start', paddingLeft: '20vw', zIndex: 20 }}>
        <motion.div style={{ y: oriPhaseAnim.y, opacity: oriPhaseAnim.opacity, textAlign: 'left', maxWidth: '500px' }}>
          <p style={styles.p_label}>OriPhaseLogic™</p>
          <p style={styles.p_body}>Technology</p>
        </motion.div>
      </motion.div>

      {/* --- BUTTONS --- */}
      <motion.div style={{ 
        position: 'fixed', 
        top: '2rem', 
        left: '50%', 
        x: '-50%',
        zIndex: 100, 
        display: 'flex', 
        gap: '2.5rem', 
        opacity: ctaOpacity 
      }}>
         <button style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer' }}>Ori Scan</button>
         <button style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer' }}>Comparison</button>
         <button style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer' }}>Testimonial</button>
         <button style={{ color: 'rgb(147, 147, 147)', background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer' }}>About</button>
         <button style={{ color: 'rgb(147, 147, 147)', background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer' }}>New Revenue</button>
      </motion.div>
    </main>
  );
}