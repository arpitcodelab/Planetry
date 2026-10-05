import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export class StoryController {
  constructor(threeScene, soundEngine, onProgressUpdate) {
    this.threeScene = threeScene;
    this.soundEngine = soundEngine;
    this.onProgressUpdate = onProgressUpdate;

    this.currentAct = 0;
    this.lenis = null;

    this.initLenis();
    this.initScrollTriggers();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential cinematic deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      if (this.soundEngine && Math.abs(e.velocity) > 0.5) {
        this.soundEngine.pulseVelocity(Math.abs(e.velocity));
      }
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  initScrollTriggers() {
    const sections = gsap.utils.toArray('.story-act');
    const totalActs = sections.length;

    // Master Timeline across the entire document
    ScrollTrigger.create({
      trigger: '#story-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress;
        this.threeScene.setScrollProgress(progress);
        
        const actIndex = Math.min(Math.floor(progress * totalActs), totalActs - 1);
        if (actIndex !== this.currentAct) {
          this.currentAct = actIndex;
          this.soundEngine.triggerActTransition(actIndex);
        }

        if (this.onProgressUpdate) {
          this.onProgressUpdate(progress, this.currentAct);
        }
      }
    });

    // Cinematic scrub entrance and exit for each narrative card
    sections.forEach((sec, idx) => {
      const card = sec.querySelector('.narrative-card');
      const title = sec.querySelector('.act-title');
      const badge = sec.querySelector('.act-badge');
      const metrics = sec.querySelectorAll('.act-metric-card');

      if (card) {
        // Scrubbed entrance
        gsap.fromTo(card,
          { opacity: 0, y: 70, scale: 0.93, filter: 'blur(12px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1.0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 1.0
            }
          }
        );

        // Subtle stagger for internal elements
        if (badge) {
          gsap.fromTo(badge,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              scrollTrigger: {
                trigger: sec,
                start: 'top 75%',
                end: 'top 50%',
                scrub: 0.8
              }
            }
          );
        }

        if (title) {
          gsap.fromTo(title,
            { opacity: 0, letterSpacing: '0.25em' },
            {
              opacity: 1,
              letterSpacing: '0.12em',
              scrollTrigger: {
                trigger: sec,
                start: 'top 75%',
                end: 'top 45%',
                scrub: 0.8
              }
            }
          );
        }

        if (metrics.length > 0) {
          gsap.fromTo(metrics,
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              scrollTrigger: {
                trigger: sec,
                start: 'top 65%',
                end: 'top 35%',
                scrub: 0.8
              }
            }
          );
        }

        // Scrubbed exit (except final act) so the camera dives cleanly into space
        if (idx < sections.length - 1) {
          gsap.to(card, {
            opacity: 0,
            y: -60,
            scale: 0.95,
            filter: 'blur(10px)',
            ease: 'power2.in',
            scrollTrigger: {
              trigger: sec,
              start: 'bottom 65%',
              end: 'bottom 20%',
              scrub: 1.0
            }
          });
        }
      }
    });
  }

  scrollToAct(actIndex) {
    const target = document.querySelector(`[data-act-section="${actIndex}"]`);
    if (target && this.lenis) {
      this.lenis.scrollTo(target, {
        duration: 2.2,
        offset: -40,
        easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      });
    }
  }
}
