
'use client'

export default function VideoCard() {
    return (
        <div className="w-full h-full flex justify-center items-center relative z-10">
            <div className="w-full h-full">
                <iframe 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full max-w-[780px] min-h-[434px] rounded-[16px] mx-auto"
                ></iframe>
            </div>
        </div>
    )
}
