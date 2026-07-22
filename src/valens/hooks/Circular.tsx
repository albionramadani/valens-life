"use client"

import React, { useState, useEffect, useRef } from 'react';

const CircleProgress = ({
  duration = 4200,
  finish = 85,
}) => {
  const [isInViewport, setIsInViewport] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const circleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // 0.1 means 10% of the element must be visible
      }
    );

    if (circleRef.current) {
      observer.observe(circleRef.current);
    }

    return () => {
      if (circleRef.current) {
        observer.unobserve(circleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInViewport && percentage <= finish) {
      const interval = duration / 100;
  
      const easeOutQuad = (t:any) => t * (2 - t);
  
      const increment = () => {
        setTimeout(() => {
          const newPercentage = percentage + 1;
          const newDisplayedProgress = Math.round(easeOutQuad(newPercentage / finish) * finish);
          setPercentage(newPercentage);
          setDisplayedProgress(newDisplayedProgress);
        }, interval);
      };
  
      increment();
  
      return () => {
        clearTimeout(interval);
      };
    }
  }, [isInViewport, percentage, duration, finish]);
  

  const r = 34;
  const c = Math.PI * (r * 2);
  const pct = ((100 - displayedProgress) / 100) * c;

  return (
    <div ref={circleRef} className="circle-progress" data-pct={displayedProgress}>
      <svg className="circle-progress-content" viewBox="0 0 74 74">
        <circle
          className="bg"
          cx="37"
          cy="37"
          r="34"
          fill="none"
          strokeWidth="6"
          strokeDasharray="213.63"
          strokeDashoffset={0}
        />
        <circle
          className="bar"
          cx="37"
          cy="37"
          r="34"
          fill="none"
          strokeWidth="6"
          strokeDasharray="213.63"
          strokeDashoffset={pct}
        />
      </svg>
    </div>
  );
};

export default CircleProgress;