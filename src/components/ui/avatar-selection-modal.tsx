'use client'

import { useState } from 'react'

interface Avatar {
  id: string
  name: string
  imageUrl: string
  category: 'custom' | 'default'
}

interface AvatarSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAvatarSelect: (avatarId: string) => void
  selectedAvatar?: string
}

const AVATARS: Avatar[] = [
  // Custom Avatars
  { id: 'SHF34020', name: 'SHF34020', imageUrl: '/avatars/custom-1.jpg', category: 'custom' },
  { id: 'FRM89034', name: 'FRM89034', imageUrl: '/avatars/custom-2.jpg', category: 'custom' },
  
  // Default Avatars
  { id: 'Gorilla-1', name: 'Gorilla 1', imageUrl: '/avatars/gorilla-1.jpg', category: 'default' },
  { id: 'Shawheen', name: 'Shawheen', imageUrl: '/avatars/shawheen.jpg', category: 'default' },
  { id: 'Verified HeyGen Avatar', name: 'Verified HeyGen Avatar', imageUrl: '/avatars/heygen.jpg', category: 'default' },
  { id: 'Varied', name: 'Varied', imageUrl: '/avatars/varied.jpg', category: 'default' },
  { id: 'VAL77889', name: 'VAL77889', imageUrl: '/avatars/val77889.jpg', category: 'default' },
  { id: 'PIP34567', name: 'PIP34567', imageUrl: '/avatars/pip34567.jpg', category: 'default' },
  { id: 'PN100234', name: 'PN100234', imageUrl: '/avatars/pn100234.jpg', category: 'default' },
  { id: 'CON11223', name: 'CON11223', imageUrl: '/avatars/con11223.jpg', category: 'default' },
  { id: 'XTR12340', name: 'XTR12340', imageUrl: '/avatars/xtr12340.jpg', category: 'default' },
  { id: 'DRV34567', name: 'DRV34567', imageUrl: '/avatars/drv34567.jpg', category: 'default' },
  { id: 'BLD67543', name: 'BLD67543', imageUrl: '/avatars/bld67543.jpg', category: 'default' },
  { id: 'Account', name: 'Account', imageUrl: '/avatars/account.jpg', category: 'default' },
  { id: 'FRM11223', name: 'FRM11223', imageUrl: '/avatars/frm11223.jpg', category: 'default' },
  { id: 'SHF56789', name: 'SHF56789', imageUrl: '/avatars/shf56789.jpg', category: 'default' },
]

export default function AvatarSelectionModal({ 
  isOpen, 
  onClose, 
  onAvatarSelect, 
  selectedAvatar 
}: AvatarSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'custom' | 'default'>('default')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAvatars = AVATARS.filter(avatar => 
    avatar.category === selectedCategory && 
    avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAvatarSelect = (avatar: Avatar) => {
    onAvatarSelect(avatar.id)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[800px] w-full max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b">
          <h3 className="text-2xl font-semibold text-[#282828]">
            Select Avatar
          </h3>
          <button onClick={onClose} className="cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setSelectedCategory('custom')}
            className={`px-4 py-3 font-medium transition-colors ${
              selectedCategory === 'custom' 
                ? 'text-[#5046E5] border-b-2 border-[#5046E5]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Custom Avatar
          </button>
          <button
            onClick={() => setSelectedCategory('default')}
            className={`px-4 py-3 font-medium transition-colors ${
              selectedCategory === 'default' 
                ? 'text-[#5046E5] border-b-2 border-[#5046E5]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Default Avatar
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <input
            type="text"
            placeholder="Search avatars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5046E5]"
          />
        </div>

        {/* Avatar Grid */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredAvatars.map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar)}
                className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${
                  selectedAvatar === avatar.id 
                    ? 'border-[#5046E5] ring-2 ring-[#5046E5]/20' 
                    : 'border-gray-200 hover:border-[#5046E5]'
                }`}
              >
                <div className="aspect-square relative bg-gray-100">
                  {/* Placeholder for avatar images - replace with actual images */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {avatar.name}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 text-center">
                  {avatar.name}
                </div>
                {selectedAvatar === avatar.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#5046E5] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
