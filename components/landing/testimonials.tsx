"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useRef, useState } from "react";

const testimonials = [
  {
    quote:
      "The analogy engine is incredible. It explained system design concepts in a way that finally clicked for me.",
    author: "Sarah K.",
    role: "Senior Frontend Engineer",
    company: "Hired at FAANG",
    rating: 5,
  },
  {
    quote:
      "I prepped for 3 days using SyntaxState and got an offer. The personalized content was exactly what I needed.",
    author: "Marcus T.",
    role: "Full Stack Developer",
    company: "Hired at Series B Startup",
    rating: 5,
  },
  {
    quote:
      "The rapid-fire questions helped me practice thinking on my feet. Game changer for behavioral rounds.",
    author: "Priya M.",
    role: "Backend Engineer",
    company: "Hired at Fintech",
    rating: 5,
  },
  {
    quote:
      "Finally a prep tool that doesn't feel like a chore. The UI is beautiful and the content is top notch.",
    author: "James L.",
    role: "Software Engineer",
    company: "Hired at Tech Giant",
    rating: 5,
  },
  {
    quote:
      "The AI coaching feature is like having a senior engineer mentor you 24/7. Highly recommended.",
    author: "Elena R.",
    role: "Product Engineer",
    company: "Hired at Unicorn",
    rating: 5,
  },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-24 overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
          Loved by engineers.
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of developers who've landed their dream jobs.
        </p>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`flex gap-6 min-w-full ${!isDragging ? 'animate-marquee' : ''}`}>
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={`${testimonial.author}-${index}`}
                className="flex-shrink-0 w-[350px] md:w-[400px] p-8 rounded-3xl bg-secondary/30 backdrop-blur-sm border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-foreground text-foreground"
                    />
                  ))}
                </div>

                <p className="text-lg font-medium leading-relaxed mb-8">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-background z-10 pointer-events-none" />
      </div>
    </section>
  );
}
