"use client"

import React, { useState, useRef, useEffect } from 'react'
import Marquee from "react-fast-marquee";


const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting)
                {
                    // Add slight delay before triggering animation for more natural feel
                    setTimeout(() => {
                        setIsIntersecting(true);
                    }, 100);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [options]);

    return [ref, isIntersecting] as const;
};



export default function Partners(){

    const partner = [
        {
            id: "keller-williams",
            title: "Keller Williams"
        },
        {
            id: "century-21",
            title: "Century 21" 
        },
        {
            id: "remax",
            title: "RE/MAX"
        },
        {
            id: "coldwell-banker",
            title: "Coldwell Banker"
        },
        {
            id: "sotheby's",
            title: "Sotheby's"
        }
    ]


        // Animation refs for smooth Apple-like animations
        const [containerRef] = useIntersectionObserver();
    

    return(
        <div ref={containerRef} className="bg-[#060609] px-3 pb-20 pt-32 -mt-16" style={{ backgroundImage: 'url(/images/price-bg.png)', backgroundSize: 'cover', backgroundPosition: 'top', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
            <div className="max-w-[1340px] mx-auto">
                <h1 className="text-center text-white text-[20px] font-semibold mb-7">TRUSTED BY LEADING REAL ESTATE PROFESSIONALS</h1>
                <div className="flex flex-wrap justify-center items-center gap-10">
                {partner.map((item, index) => (
                    <div key={index} className="px-[24.5px] py-[12px] bg-white/30 rounded-[8px] justify-center items-center text-white text-[28px] font-semibold hidden">
                        {item.title}
                    </div>
                ))}
                <Marquee
                    pauseOnHover
                    direction="left"
                    speed={50}
                    className="overflow-hidden"
                    gradient={false}
                >
                    {partner.map((client) => {
                        return (
                            <div
                                key={client.id}
                                className={`px-[24.5px] py-[12px] bg-white/30 rounded-[8px] flex justify-center items-center text-white text-[18px] md:text-[28px] font-semibold transition-all duration-700 ease-out mx-5
                                `}
                            >
                                {client.title}

                            </div>
                        )
                    })}
                    {/* Duplicate partners for seamless loop */}
                    {partner.map((client) => {
                        return (
                            <div
                                key={`${client.id}-duplicate`}
                                className={`px-[24.5px] py-[12px] bg-white/30 rounded-[8px] flex justify-center items-center text-white text-[18px] md:text-[28px] font-semibold transition-all duration-700 ease-out mx-5
                                `}
                            >
                                {client.title}

                            </div>
                        )
                    })}
                </Marquee>
                </div>
            </div>
        </div>
    )
}