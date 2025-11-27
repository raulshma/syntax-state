"use client";

import { motion } from "framer-motion";
import { ArrowRight, Layers, Code2, Users, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

const items = [
    {
        id: 1,
        title: "System Design",
        subtitle: "Architect Scalable Systems",
        description:
            "Master the art of designing large-scale distributed systems. From load balancers to database sharding.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
        icon: Layers,
    },
    {
        id: 2,
        title: "Data Structures",
        subtitle: "Optimize Your Code",
        description:
            "Deep dive into trees, graphs, and dynamic programming. Write efficient, production-ready code.",
        color: "text-green-500",
        bg: "bg-green-500/10",
        gradient: "from-green-500/20 via-green-500/5 to-transparent",
        icon: Code2,
    },
    {
        id: 3,
        title: "Behavioral",
        subtitle: "Lead with Confidence",
        description:
            "Learn to articulate your impact and leadership style using the STAR method.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
        icon: Users,
    },
    {
        id: 4,
        title: "Frontend Mastery",
        subtitle: "Build Modern UIs",
        description:
            "Expert-level React, performance optimization, and accessibility patterns.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
        icon: LayoutTemplate,
    },
];

export function ShowcaseScroll() {
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
        <section className="py-32 bg-background overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 mb-16 flex items-end justify-between">
                <div>
                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
                        Comprehensive Modules.
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                        Everything you need to crack the interview, broken down into
                        digestible paths.
                    </p>
                </div>
                <div className="hidden md:flex gap-2">
                    {/* Custom navigation controls could go here */}
                </div>
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
                    <div className={`flex gap-8 min-w-full px-6 ${!isDragging ? 'animate-marquee' : ''}`}>
                        {[...items, ...items, ...items].map((item, index) => (
                            <motion.div
                                key={`${item.id}-${index}`}
                                className="flex-shrink-0 w-[85vw] md:w-[500px] h-[500px] relative rounded-[2.5rem] overflow-hidden group cursor-pointer border border-border/50 bg-card/30 backdrop-blur-sm hover:border-border/80 transition-colors duration-500"
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-700`}
                                />

                                <div className="absolute inset-0 p-10 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div
                                            className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-sm`}
                                        >
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 bg-background/50 backdrop-blur-md hover:bg-background/80"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                            {item.subtitle}
                                        </h3>
                                        <h4 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground tracking-tight">
                                            {item.title}
                                        </h4>
                                        <p className="text-lg text-muted-foreground/80 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-background z-10 pointer-events-none" />
            </div>
        </section>
    );
}
