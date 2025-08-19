'use client'

import { useState } from 'react'
import Image from 'next/image'
import CreateVideoModal from './create-video-modal'

// Mock data for video cards with YouTube URLs
const videoCards = [
  {
    id: 1,
    title: 'Property Listing Video',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: 2,
    title: 'Neighborhood Tour',
    youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
  },
  {
    id: 3,
    title: 'Agent Introduction',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
  },
  {
    id: 4,
    title: 'Video Production Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
  },
  {
    id: 5,
    title: 'Property Showcase',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
    thumbnail: 'https://img.youtube.com/vi/ZZ5LpwO-An4/hqdefault.jpg',
  },
  {
    id: 6,
    title: 'Mobile App Demo',
    youtubeUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
  },
  {
    id: 7,
    title: 'Sold Property Highlight',
    youtubeUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
  },
  {
    id: 8,
    title: 'Digital Marketing',
    youtubeUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
  },
  {
    id: 9,
    title: 'Client Testimonial',
    youtubeUrl: 'https://www.youtube.com/watch?v=U9t-slLl30E',
    thumbnail: 'https://img.youtube.com/vi/U9t-slLl30E/hqdefault.jpg',
  }
]

interface PreviousVideosGalleryProps {
  className?: string
}

export default function PreviousVideosGallery({ className }: PreviousVideosGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVideoForCreation, setSelectedVideoForCreation] = useState<string>('')
  const [selectedVideoData, setSelectedVideoData] = useState<{ title: string; youtubeUrl: string; thumbnail: string } | null>(null)

  const handleViewVideo = (video: { id: number; title: string; youtubeUrl: string; thumbnail: string }) => {
    setSelectedVideoForCreation(video.title)
    setSelectedVideoData(video)
    setIsCreateModalOpen(true)
  }

  const handleImageError = (videoId: number) => {
    setImageErrors(prev => new Set(prev).add(videoId))
  }

  return (
    <div className={`w-full ${className}`}>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {videoCards.map((video) => (
          <div
            key={video.id}
            className="bg-[#EEEEEE] rounded-[12px] overflow-hidden transition-all duration-300 group min-h-[275px]"
          >
            {/* Thumbnail Container */}
             <div className="relative aspect-video max-h-[165px] w-full bg-[#EEEEEE] overflow-visible px-3 pt-3 rounded-[8px]">              
               {/* YouTube Thumbnail */}
                {imageErrors.has(video.id) ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-[6px]">
                    <div className="text-gray-400 text-sm">Video Thumbnail</div>
                  </div>
                ) : (
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title}
                    width={400}
                    height={250}
                    className="w-full h-[165px] object-cover rounded-[6px]"
                    onError={() => handleImageError(video.id)}
                  />
                )}
             </div>

            {/* Content */}
            <div className="p-4">
              {/* Video Title */}
              <h3 className="text-[18px] font-medium text-[#171717] my-3 line-clamp-2">
                {video.title}
              </h3>

                                 {/* View Video Button */}
                                 <button
                   onClick={() => handleViewVideo(video)}
                   className="w-full bg-[#5046E5] text-white py-[3px] px-4 rounded-full font-semibold text-[16px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                 >
                   View Video
                 </button>
            </div>
          </div>
        ))}
      </div>


                       {/* Create Video Modal */}
        <CreateVideoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          videoTitle={selectedVideoForCreation}
          startAtComplete={true}
          videoData={selectedVideoData}
        />
      </div>
    )
  }
