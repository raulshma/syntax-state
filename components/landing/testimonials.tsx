"use client";

import { Star } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "The journeys made it obvious what to learn next. I finally stopped guessing and started progressing.",
    author: "Sarah K.",
    role: "Senior Frontend Engineer",
    company: "Hired at FAANG",
    rating: 5,
  },
  {
    quote:
      "I used the lessons + AI chat to close gaps fast. The explanations were clear and the practice felt realistic.",
    author: "Marcus T.",
    role: "Full Stack Developer",
    company: "Hired at Series B Startup",
    rating: 5,
  },
  {
    quote:
      "The practice modes helped me build confidence quickly. Rapid-fire drills are a game changer.",
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
      "The AI chat feels like a senior engineer on demand — perfect for getting unstuck and going deeper.",
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
    <section className="py-32 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
          Loved by engineers
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of developers leveling up with journeys, lessons, and practice.
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
          <div
            className={cn(
              "flex gap-8 min-w-full px-6",
              !isDragging && "animate-marquee",
            )}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={`${testimonial.author}-${index}`}
                className="shrink-0 w-[350px] md:w-[450px] p-10 rounded-4xl bg-secondary/20 backdrop-blur-sm border border-border/40 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>

                <p className="text-xl font-medium leading-relaxed mb-10 text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-lg text-primary-foreground shadow-lg shadow-primary/20">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-r from-transparent to-background z-10 pointer-events-none" />
      </div>
    </section>
  );
}
