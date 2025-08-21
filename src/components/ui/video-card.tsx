'use client'

export default function VideoCard() {
    return (
        <div className="w-full h-full flex justify-center items-center relative z-10">
            <div className="w-full h-full">
                <iframe 
                    src="https://www.youtube.com/embed/ZhGhnZ3InJA?si=8q5aBFAIfungGu2s&modestbranding=1&rel=0&showinfo=0&controls=1&iv_load_policy=3&cc_load_policy=0&fs=1&disablekb=0&autoplay=0&mute=0" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="w-full h-full max-w-[780px] min-h-[434px] rounded-[16px] mx-auto"
                ></iframe>
            </div>
        </div>
    )
}