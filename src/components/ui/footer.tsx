'use client'

import Link from 'next/link'
import { BRAND_NAME } from '@/lib/constants'
// import { FaFacebook, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer() {

    const navigationLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Services', href: '/services' },
        { name: 'Reservation', href: '/reservation' }
    ]

    // const socialLinks = [
    //     { icon: FaFacebook, href: '#', label: 'Facebook' },
    //     { icon: FaYoutube, href: '#', label: 'YouTube' },
    //     { icon: FaInstagram, href: '#', label: 'Instagram' },
    //     { icon: FaLinkedin, href: '#', label: 'LinkedIn' }
    // ]


    return (
        <footer className="bg-gray-100 border-t border-[#919191]">            
            {/* Main footer content */}
            <div className="bg-white">
                <div className="max-w-[1260px] mx-auto px-3 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Left Section - Brand & Social */}
                        <div className="space-y-6">
                            {/* Brand */}
                            <div>
                            <Link 
                                href="/"
                                className="text-[#5046E5] text-[26px] font-bold"
                                aria-label={`${BRAND_NAME} - Go to homepage`}
                                >
                                EdgeAI<span className="text-[#E54B46] font-bold">Realty</span>
                                </Link>
                            </div>
                            
                            {/* Description */}
                            <p className="text-[#282828] text-base leading-relaxed max-w-md">
                                Experience the finest Turkish cuisine in Doha, from our famous home-baked bread to our enticing traditional dishes to our legendary Uzman Restaurants specialities.
                            </p>
                            
                            {/* Social Media */}
                            {/* <div className="flex flex-col gap-4">
                                <h3 className="text-[#282828] font-semibold text-[26px]">Follow Us</h3>
                                <div className="flex gap-8">
                                    {socialLinks.map((social, index) => (
                                        <Link
                                            key={index}
                                            href={social.href}
                                            aria-label={social.label}
                                        >
                                            <social.icon className="w-[26px] h-[26px] text-[#282828]" />
                                        </Link>
                                    ))}
                                </div>
                            </div> */}
                        </div>
                        
                        {/* Right Section - Navigation Links */}
                        <div className="lg:justify-self-end">
                            <h3 className="text-[#282828] font-semibold text-[26px] mb-6">Links</h3>
                            <div className="grid grid-cols-2 gap-24">
                                {/* Column 1 */}
                                <div className="space-y-3">
                                    {navigationLinks.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.href}
                                            className="block text-[#282828] text-[16px] hover:text-[#5046E5] transition-all duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                                
                                {/* Column 2 */}
                                <div className="space-y-3">
                                    {navigationLinks.map((link, index) => (
                                        <Link
                                            key={`duplicate-${index}`}
                                            href={link.href}
                                            className="block text-[#282828] text-[16px] hover:text-[#5046E5] transition-all duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
