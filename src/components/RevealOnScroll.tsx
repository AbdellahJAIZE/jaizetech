'use client';

import { useEffect } from 'react';

export default function RevealOnScroll() {
  useEffect(() => {
    document.documentElement.classList.add('js-on');

    const reveals = document.querySelectorAll<HTMLElement>('.reveal');
    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0;
    };

    const pending: HTMLElement[] = [];
    reveals.forEach((el) => {
      if (!inView(el)) {
        el.dataset.pending = 'true';
        pending.push(el);
      }
    });

    let observer: IntersectionObserver | null = null;
    if (pending.length && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              observer?.unobserve(e.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
      );
      pending.forEach((el) => observer!.observe(el));
    } else {
      pending.forEach((el) => el.classList.add('in'));
    }

    const safety = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('.reveal[data-pending="true"]:not(.in)')
        .forEach((el) => el.classList.add('in'));
    }, 1200);

    return () => {
      observer?.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
