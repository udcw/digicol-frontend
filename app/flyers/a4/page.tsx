// app/flyers/a4/page.tsx

import Image from 'next/image';
import {
  BookOpenIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  TrophyIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function A4FlyerPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      {/* A4 2480x3508 */}
      <div className="w-[2480px] h-[3508px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden shadow-2xl scale-[0.15] origin-top-left">
        
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-40 left-40 w-[800px] h-[800px] bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-40 w-[800px] h-[800px] bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '60px 60px',
          }}
        ></div>

        <div className="relative z-10 p-32 h-full flex flex-col">
          
          {/* Logo */}
          <div className="flex justify-center mb-24">
            <Image
              src="/logo.png"
              alt="DigiCol"
              width={600}
              height={200}
              className="h-auto w-auto brightness-0 invert"
            />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex items-center gap-6 bg-blue-500/20 text-blue-300 px-12 py-4 rounded-full text-4xl font-medium border border-blue-500/30">
              <CodeBracketIcon className="h-12 w-12" />
              Communauté Technologique
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[180px] font-bold text-white text-center mb-16 leading-tight">
            APPRENDRE
            <br />
            <span className="text-blue-400">PARTAGER</span>
            <br />
            INNOVER
          </h1>

          {/* Description */}
          <p className="text-5xl text-gray-300 text-center max-w-6xl mx-auto mb-24 leading-relaxed">
            Rejoins la communauté technologique qui forme les talents du numérique au Cameroun.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-12 mb-24">
            {[
              {
                icon: BookOpenIcon,
                title: 'Formations',
                desc: 'Python, React, Django, IA',
                color: 'blue',
              },
              {
                icon: RocketLaunchIcon,
                title: 'Projets',
                desc: 'Construis ton portfolio',
                color: 'orange',
              },
              {
                icon: UserGroupIcon,
                title: 'Communauté',
                desc: '120+ membres actifs',
                color: 'green',
              },
              {
                icon: TrophyIcon,
                title: 'Certificats',
                desc: 'Valorise tes compétences',
                color: 'yellow',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
                orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
                green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
                yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
              };
              const colors = colorMap[item.color] || colorMap.blue;
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12"
                >
                  <div className={`w-24 h-24 ${colors.bg} ${colors.border} border rounded-3xl flex items-center justify-center mb-8`}>
                    <Icon className={`h-14 w-14 ${colors.text}`} />
                  </div>
                  <p className="text-4xl font-bold text-white mb-3">{item.title}</p>
                  <p className="text-3xl text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-4 gap-6 mb-24">
            {[
              { value: '120+', label: 'Membres', icon: UserGroupIcon },
              { value: '20+', label: 'Formations', icon: AcademicCapIcon },
              { value: '8', label: 'Projets', icon: RocketLaunchIcon },
              { value: '540+', label: 'Certificats', icon: TrophyIcon },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <Icon className="h-10 w-10 text-blue-400" />
                  </div>
                  <p className="text-6xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-2xl text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-auto text-center">
            <div className="inline-flex items-center gap-6 bg-blue-600 text-white px-24 py-12 rounded-3xl text-7xl font-bold mb-12">
              <CodeBracketIcon className="h-20 w-20" />
              digicol.com
            </div>
            <p className="text-4xl text-gray-400">
              Inscription gratuite
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-16 border-t border-white/10">
            <div className="flex items-center justify-center gap-8 mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
              <p className="text-3xl text-gray-500">
                DigiCol — Apprendre · Partager · Innover
              </p>
              <BriefcaseIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}