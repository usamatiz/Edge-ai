'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, ChevronDown } from 'lucide-react'
import CreateVideoModal from './create-video-modal'

// Mock data for video cards with YouTube URLs and creation dates
const videoCards = [
  {
    id: 1,
    title: 'Property Listing Video',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Neighborhood Tour',
    youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    title: 'Agent Introduction',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
    createdAt: '2024-01-10',
  },
  {
    id: 4,
    title: 'Video Production Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    createdAt: '2024-01-25',
  },
  {
    id: 5,
    title: 'Property Showcase',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
    thumbnail: 'https://img.youtube.com/vi/ZZ5LpwO-An4/hqdefault.jpg',
    createdAt: '2024-01-05',
  },
  {
    id: 6,
    title: 'Mobile App Demo',
    youtubeUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
    createdAt: '2024-01-30',
  },
  {
    id: 7,
    title: 'Sold Property Highlight',
    youtubeUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    createdAt: '2024-01-12',
  },
  {
    id: 8,
    title: 'Digital Marketing',
    youtubeUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    createdAt: '2024-01-18',
  },
  {
    id: 9,
    title: 'Client Testimonial',
    youtubeUrl: 'https://www.youtube.com/watch?v=U9t-slLl30E',
    thumbnail: 'https://img.youtube.com/vi/U9t-slLl30E/hqdefault.jpg',
    createdAt: '2024-01-22',
  }
]

type SortOrder = 'newest' | 'oldest'

type VideoCard = {
  id: number
  title: string
  youtubeUrl: string
  thumbnail: string
  createdAt: string
}

interface PreviousVideosGalleryProps {
  className?: string
}

export default function PreviousVideosGallery({ className }: PreviousVideosGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVideoForCreation, setSelectedVideoForCreation] = useState<string>('')
  const [selectedVideoData, setSelectedVideoData] = useState<{ title: string; youtubeUrl: string; thumbnail: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  const handleViewVideo = (video: VideoCard) => {
    setSelectedVideoForCreation(video.title)
    setSelectedVideoData({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      thumbnail: video.thumbnail
    })
    setIsCreateModalOpen(true)
  }

  const handleImageError = (videoId: number) => {
    setImageErrors(prev => new Set(prev).add(videoId))
  }

  // Filter and sort videos based on search query and sort order
  const filteredAndSortedVideos = useMemo(() => {
    // Filter by search query
    const filtered = videoCards.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort by creation date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      
      if (sortOrder === 'newest') {
        return dateB - dateA // Newest first
      } else {
        return dateA - dateB // Oldest first
      }
    })
  }, [searchQuery, sortOrder])

  const handleSortChange = (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder)
    setIsSortDropdownOpen(false)
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-[402px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search video titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center gap-2 min-w-[180px] justify-between"
          >
            <span>
              {sortOrder === 'newest' ? 'Newest → Oldest' : 'Oldest → Newest'}
            </span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isSortDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg">
              <button
                type="button"
                onClick={() => handleSortChange('newest')}
                className={`w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 rounded-t-[8px] ${
                  sortOrder === 'newest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
                }`}
              >
                Newest → Oldest
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('oldest')}
                className={`w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 rounded-b-[8px] ${
                  sortOrder === 'oldest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
                }`}
              >
                Oldest → Newest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredAndSortedVideos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No videos found matching your search.' : 'No videos available.'}
            </p>
          </div>
        ) : (
          filteredAndSortedVideos.map((video) => (
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
          ))
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isSortDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsSortDropdownOpen(false)}
        />
      )}


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
