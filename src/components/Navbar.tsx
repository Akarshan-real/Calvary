'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  UtensilsCrossed,
  MenuIcon,
  XIcon,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'

import ProfileDropdown from '@/components/kokonutui/profile-dropdown'
import SlideTextButton from '@/components/kokonutui/slide-text-button'
import ParticleButton from '@/components/kokonutui/particle-button'

interface CtaNavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    avatar?: string | null
    role?: string
    phone?: string | null
  } | null
}

const navLinks = [
  { title: 'HOME', link: '/' },
  { title: 'MENU', link: '/menu' },
  { title: 'ABOUT', link: '/about-us' },
  { title: 'GALLERY', link: '/galary' },
  { title: 'CONTACT', link: '/contact' },
]

export default function CtaNavbar({ user = null }: CtaNavbarProps) {
  const [showNav, setShowNav] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleShowNav = () => {
    setShowNav(!showNav)
  }

  const handleNavigate = (link: string) => {
    setShowNav(false)
    router.push(link)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#12141a]/95 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left Side: Hamburger, Brand Logo, Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          <ParticleButton
            onClick={handleShowNav}
            aria-label="Toggle navigation menu"
            className="md:hidden !p-0 flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-800/80 border border-white/10 text-neutral-200 hover:text-[#ffbe33] transition-colors shadow-none"
          >
            {showNav ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </ParticleButton>

          {/* Logo with Circular Icon and Calvary Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden ring-2 ring-[#ffbe33]/60 group-hover:ring-[#ffbe33] transition-all shadow-md shrink-0 aspect-square">
              <Image
                src="/assets/images/logo.png"
                alt="Calvary Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <span
              className="text-2xl sm:text-3xl font-bold text-white tracking-wide leading-none"
              style={{ fontFamily: 'var(--font-cursive), cursive' }}
            >
              Calvary
            </span>
          </Link>

          {/* Desktop Nav links with ParticleButton on click */}
          <div
            className={`absolute right-0 left-0 -z-10 flex w-full flex-col gap-1 bg-[#12141a]/98 p-4 shadow-xl border-b border-white/10 transition-all duration-300 ease-in-out md:relative md:top-auto md:right-auto md:left-0 md:z-auto md:flex-row md:gap-2 md:bg-transparent md:p-0 md:shadow-none md:border-none ${
              showNav ? 'top-[64px]' : 'top-[-260px]'
            }`}
          >
            {navLinks.map(({ title, link }, index) => {
              const isActive = pathname === link
              return (
                <ParticleButton
                  key={index}
                  onClick={() => handleNavigate(link)}
                  className={cn(
                    'h-auto rounded-lg px-3.5 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-150 border-none shadow-none',
                    isActive
                      ? 'text-[#ffbe33] bg-white/10 md:bg-white/5 font-extrabold shadow-sm'
                      : 'text-neutral-300 bg-transparent hover:bg-white/5 hover:text-[#ffbe33]'
                  )}
                >
                  <span>{title}</span>
                </ParticleButton>
              )
            })}
          </div>
        </div>

        {/* Right Side: Profile Dropdown & Highlighted Yellow "Book Table" CTA */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Kokonut UI Profile Dropdown Menu when authenticated */}
          {user ? (
            <ProfileDropdown
              data={{
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
              }}
              onSignOut={logout}
            />
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-800/80 border border-white/15 text-neutral-300 hover:text-[#ffbe33] hover:border-[#ffbe33] transition-all"
              title="Sign In / Register"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          )}

          {/* Kokonut UI SlideTextButton on Book Table CTA */}
          <SlideTextButton
            href="/reserve"
            text="Book Table"
            hoverText="Let's Go"
            variant="gold"
            icon={<UtensilsCrossed size={16} className="text-neutral-950 stroke-[2.5]" />}
          />
        </div>

      </div>
    </nav>
  )
}
