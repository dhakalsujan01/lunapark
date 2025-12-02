"use client"

import clsx from 'clsx'
import { useTranslations } from 'next-intl'

interface TeamMember {
  name: string
  position: string
  quote: string
  image: string
  background: string[]
  linkedIn?: string
  email?: string
}

interface TeamMemberProfileProps {
  member: TeamMember
  index: number
}

function TeamMemberProfile({ member, index }: TeamMemberProfileProps) {
  const t = useTranslations('about.team')
  const isReversed = index % 2 === 1

  return (
    <div className="bg-white dark:bg-gray-900 py-16 px-6 lg:px-8 transition-colors duration-300">
      <div
        className={clsx(
          'max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start',
        )}
      >
        {/* Column 1: Team Member Info (Name, Quote) */}
        <div
          className={clsx(
            'space-y-6',
            // On large screens, move this column to the right for reversed layout
            isReversed && 'lg:order-2 lg:text-right',
          )}
        >
          <div className={clsx('space-y-4', isReversed && 'lg:flex lg:flex-col lg:items-end')}>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] transition-colors duration-300">
              {t('meetOurTeam')}
            </p>
            <div className="w-12 h-px bg-amber-400 dark:bg-amber-500 transition-colors duration-300"></div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 dark:text-white leading-tight text-balance transition-colors duration-300">
              {member.name}
            </h1>
            <blockquote className="text-lg text-gray-700 dark:text-gray-200 italic font-serif leading-relaxed transition-colors duration-300">
              "{member.quote}"
            </blockquote>
          </div>
        </div>

        {/* Column 2: Image and Details */}
        <div
          className={clsx(
            'flex flex-col gap-6 items-start',
            // On large screens, move this column to the left for reversed layout and reverse its internal content
            isReversed ? 'lg:order-1 lg:flex-row-reverse' : 'lg:flex-row',
          )}
        >
          {/* Professional Headshot */}
          <div className={clsx('flex-shrink-0', isReversed ? 'lg:-mr-8' : 'lg:-ml-8')}>
            <img
              src={member.image || '/placeholder-user.jpg'}
              alt={`${member.name} - ${member.position}`}
              className={clsx(
                'w-full lg:w-80 h-96 object-cover rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300',
                // Note: Flipping the image with `scale-x-[-1]` is often not ideal for portraits.
                // The alternating layout is usually enough visual distinction. I've removed it for a cleaner look.
              )}
            />
          </div>

          {/* Position and Background Details */}
          <div className="space-y-6 font-sans mt-8 lg:mt-16 flex-grow min-w-0">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {member.position}
              </h3>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-200 leading-relaxed transition-colors duration-300">
              {member.background.map((paragraph, idx) => (
                <p key={idx} className="transition-colors duration-300">{paragraph}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <div className="flex items-center gap-4">
                {member.linkedIn && (
                  <>
                    <a href={member.linkedIn} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-200 underline underline-offset-2">
                      {t('linkedIn')}
                    </a>
                    {member.email && <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300">|</span>}
                  </>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-200 underline underline-offset-2">
                    {t('email')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamMembersSection() {
    const t = useTranslations('about.team')
    
    // Team members data with translations
    const teamMembers: TeamMember[] = [
        {
            name: t('members.sarahChen.name'),
            position: t('members.sarahChen.position'),
            quote: t('members.sarahChen.quote'),
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face",
            background: [
                t('members.sarahChen.background.0'),
                t('members.sarahChen.background.1')
            ],
            linkedIn: "https://linkedin.com/in/sarah-chen",
            email: "sarah.chen@lunapark.com"
        },
        {
            name: t('members.marcusRodriguez.name'),
            position: t('members.marcusRodriguez.position'),
            quote: t('members.marcusRodriguez.quote'),
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
            background: [
                t('members.marcusRodriguez.background.0'),
                t('members.marcusRodriguez.background.1')
            ],
            linkedIn: "https://linkedin.com/in/marcus-rodriguez",
            email: "marcus.rodriguez@lunapark.com"
        },
        {
            name: t('members.emilyWatson.name'),
            position: t('members.emilyWatson.position'),
            quote: t('members.emilyWatson.quote'),
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
            background: [
                t('members.emilyWatson.background.0'),
                t('members.emilyWatson.background.1')
            ],
            linkedIn: "https://linkedin.com/in/emily-watson",
            email: "emily.watson@lunapark.com"
        },
        {
            name: t('members.davidKim.name'),
            position: t('members.davidKim.position'),
            quote: t('members.davidKim.quote'),
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
            background: [
                t('members.davidKim.background.0'),
                t('members.davidKim.background.1')
            ],
            linkedIn: "https://linkedin.com/in/david-kim",
            email: "david.kim@lunapark.com"
        }
    ]
    
    return (
        <div>
            {teamMembers.map((member, index) => (
                <TeamMemberProfile key={index} member={member} index={index} />
            ))}
        </div>
    )
}