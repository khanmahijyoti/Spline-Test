import { motion, useScroll, useTransform } from 'framer-motion';
import Spline from '@splinetool/react-spline/next';

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -150]); // parallax effect

  return (
    <motion.div
      style={{
        y,
        width: '100%',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      <Spline
        scene="https://prod.spline.design/ABPK6hh8qjl9jvmL/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  );
}
