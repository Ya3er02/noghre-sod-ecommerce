import { useRef, useEffect } from 'react';
import './LiquidBackground.css';

interface LiquidBackgroundProps {
  children?: React.ReactNode;
}

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // تنظیم اندازه canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // تشخیص دستگاه‌های ضعیف
    const isLowPerformance = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    // تعداد ذرات بر اساس عملکرد دستگاه
    const particleCount = isLowPerformance ? 40 : 80;

    // ایجاد ذرات
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    // تعامل با موس
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // تعامل با لمس
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);

    // انیمیشن
    const animate = () => {
      // پس‌زمینه سیاه
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // اعمال فیلتر blur برای افکت liquid
      ctx.filter = 'blur(40px) contrast(15)';

      particles.forEach((particle) => {
        // به‌روزرسانی موقعیت
        particle.x += particle.vx;
        particle.y += particle.vy;

        // تعامل با موس
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          particle.vx += dx * 0.0001;
          particle.vy += dy * 0.0001;
        }

        // محدود کردن سرعت
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > 2) {
          particle.vx = (particle.vx / speed) * 2;
          particle.vy = (particle.vy / speed) * 2;
        }

        // بازگشت به صفحه در صورت خروج
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // رسم ذرات با گرادیانت نقره‌ای
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `rgba(192, 192, 192, ${particle.alpha})`); // نقره‌ای روشن
        gradient.addColorStop(0.5, `rgba(169, 169, 169, ${particle.alpha * 0.7})`); // نقره‌ای متوسط
        gradient.addColorStop(1, `rgba(128, 128, 128, 0)`); // خاکستری محو

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.filter = 'none';

      // بهینه‌سازی برای دستگاه‌های ضعیف
      if (isLowPerformance) {
        // اجرای انیمیشن با سرعت کمتر
        setTimeout(() => {
          animationIdRef.current = requestAnimationFrame(animate);
        }, 32); // تقریباً 30 FPS
      } else {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div className="liquid-background-container">
      <canvas ref={canvasRef} className="liquid-background-canvas" />
      <div className="liquid-background-content">{children}</div>
    </div>
  );
};

export default LiquidBackground;
