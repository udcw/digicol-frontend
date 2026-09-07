// app/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpenIcon, 
  RocketLaunchIcon, 
  UserGroupIcon,
  LightBulbIcon,
  FolderIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  CalendarIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CodeBracketSquareIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ------------------------------------------------------------
// DONNÉES COHÉRENTES POUR UN LANCEMENT RÉCENT
// ------------------------------------------------------------

const STATS = [
  { value: '120+', label: 'Membres', icon: UserGroupIcon },
  { value: '8', label: 'Projets en cours', icon: FolderIcon },
  { value: '6', label: 'Ateliers réalisés', icon: BookOpenIcon },
  { value: '8', label: 'Technologies', icon: CodeBracketIcon },
];

const DOMAINS = [
  { 
    name: 'Web', 
    icon: CodeBracketSquareIcon, 
    techs: ['HTML', 'CSS', 'JavaScript', 'React', 'Django'],
    color: 'from-blue-500 to-cyan-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  { 
    name: 'Cloud & DevOps', 
    icon: CloudIcon, 
    techs: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    color: 'from-orange-500 to-yellow-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  { 
    name: 'Cybersécurité', 
    icon: ShieldCheckIcon, 
    techs: ['Linux', 'Réseaux', 'SOC', 'SIEM', 'Pentest'],
    color: 'from-red-500 to-pink-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  { 
    name: 'Intelligence Artificielle', 
    icon: CpuChipIcon, 
    techs: ['Python', 'Machine Learning', 'Deep Learning', 'IA générative'],
    color: 'from-purple-500 to-violet-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  { 
    name: 'Mobile', 
    icon: BuildingLibraryIcon, 
    techs: ['React Native', 'Expo', 'API', 'Supabase'],
    color: 'from-green-500 to-emerald-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
];

const WHY_JOIN = [
  { 
    title: 'Projets réels', 
    description: 'Construis des applications utilisables et valorisables dans ton portfolio.',
    icon: FolderIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  { 
    title: 'Formations pratiques', 
    description: 'Apprends par la pratique avec des ateliers concrets et des exercices réalistes.',
    icon: AcademicCapIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  { 
    title: 'Communauté active', 
    description: 'Échange avec d\'autres passionnés, pose tes questions et partage tes connaissances.',
    icon: UserGroupIcon,
    color: 'bg-green-100 text-green-600',
  },
  { 
    title: 'Opportunités', 
    description: 'Accède à des stages, missions, emplois et collaborations au sein de notre réseau.',
    icon: BriefcaseIcon,
    color: 'bg-pink-100 text-pink-600',
  },
  { 
    title: 'Challenges & Hackathons', 
    description: 'Relève des défis techniques et participe à des compétitions pour te dépasser.',
    icon: LightBulbIcon,
    color: 'bg-yellow-100 text-yellow-600',
  },
  { 
    title: 'Networking', 
    description: 'Rencontre des développeurs, ingénieurs et experts du secteur technologique.',
    icon: GlobeAltIcon,
    color: 'bg-indigo-100 text-indigo-600',
  },
];

const UPCOMING_EVENTS = [
  { day: 'Lundi', title: 'Coding Session', time: '18h00' },
  { day: 'Mercredi', title: 'Workshop Django', time: '17h00' },
  { day: 'Vendredi', title: 'Cybersecurity Lab', time: '18h00' },
  { day: 'Samedi', title: 'Project Day', time: '14h00' },
];

const CHALLENGES = [
  { title: '30 Days Python', icon: CodeBracketIcon, color: 'from-blue-500 to-blue-600' },
  { title: 'Docker Challenge', icon: CloudIcon, color: 'from-orange-500 to-orange-600' },
  { title: 'Cyber Challenge', icon: ShieldCheckIcon, color: 'from-red-500 to-red-600' },
  { title: 'Build a Web App', icon: CodeBracketSquareIcon, color: 'from-cyan-500 to-cyan-600' },
  { title: 'AI Challenge', icon: CpuChipIcon, color: 'from-purple-500 to-purple-600' },
];

// ------------------------------------------------------------
// COMPOSANTS
// ------------------------------------------------------------

function Logo({ className = '', invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="DigiCol"
      width={220}
      height={80}
      className={`h-auto w-auto ${invert ? 'brightness-0 invert' : ''} ${className}`}
      priority
    />
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
      {children}
    </div>
  );
}

function AnimatedGrid() {
  return (
    <div 
      className="absolute inset-0 opacity-5"
      style={{ 
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}
    />
  );
}

function BackgroundGlow({ className = '' }: { className?: string }) {
  return <div className={`absolute rounded-full blur-3xl ${className}`} />;
}

// ------------------------------------------------------------
// PAGE PRINCIPALE
// ------------------------------------------------------------

export default function Home() {
  return (
    <main>
      
      {/* ============================================ */}
      {/* HERO — Sans stats */}
      {/* ============================================ */}
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center relative overflow-hidden">
        
        {/* Décorations */}
        <BackgroundGlow className="top-20 left-20 w-96 h-96 bg-blue-500 opacity-10" />
        <BackgroundGlow className="bottom-20 right-20 w-96 h-96 bg-indigo-500 opacity-10" />
        <BackgroundGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500 opacity-30" />
        <AnimatedGrid />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Contenu gauche */}
            <div>
              <div className="mb-8">
                <Logo invert />
              </div>

              <SectionBadge>
                <SparklesIcon className="h-4 w-4" />
                Tech Community & Builders Hub
              </SectionBadge>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                La communauté qui transforme les{' '}
                <span className="text-blue-400">passionnés de technologie</span>{' '}
                en <span className="text-blue-400">bâtisseurs</span>.
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                Apprends. Construis. Partage. Connecte-toi.
                Rejoins une communauté de développeurs, ingénieurs, étudiants 
                et passionnés qui construisent des projets réels autour du 
                Web, Cloud, DevOps, IA et Cybersécurité.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-medium transition shadow-lg shadow-blue-600/30"
                >
                  Rejoindre DIGICOL
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/activities"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-lg font-medium border border-white/20 transition backdrop-blur-sm"
                >
                  Découvrir nos activités
                </Link>
              </div>
            </div>

            {/* Illustration droite */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
                <div className="relative z-10 grid grid-cols-2 gap-4 p-4">
                  {[
                    { icon: CodeBracketIcon, label: 'Développement' },
                    { icon: AcademicCapIcon, label: 'Formation' },
                    { icon: RocketLaunchIcon, label: 'Projets' },
                    { icon: UserGroupIcon, label: 'Communauté' },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={index} 
                        className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-white text-center hover:scale-105 transition shadow-xl"
                      >
                        <Icon className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                        <p className="text-sm font-medium">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PHRASE FORTE + STATS — UNIQUE OCCURRENCE */}
      {/* ============================================ */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="text-2xl md:text-3xl font-bold text-white mb-12 max-w-4xl mx-auto leading-relaxed">
            « Nous ne formons pas seulement des apprenants.<br />
            <span className="text-blue-200">Nous construisons des talents capables de créer.</span> »
          </blockquote>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white border-t border-blue-500 pt-12">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index}>
                  <p className="text-4xl font-bold flex items-center justify-center gap-2">
                    <Icon className="h-8 w-8 text-blue-200" />
                    {stat.value}
                  </p>
                  <p className="text-blue-100 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* POURQUOI REJOINDRE DIGICOL ? */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <CheckCircleIcon className="h-4 w-4" />
              Pourquoi rejoindre DIGICOL ?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Qu'est-ce que je gagne en rejoignant cette communauté ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une réponse en 10 secondes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {WHY_JOIN.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOMAINES TECHNOLOGIQUES */}
      {/* ============================================ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <CodeBracketIcon className="h-4 w-4" />
              Nos domaines
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Un écosystème technologique complet
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des compétences couvrant tout le spectre du numérique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl border ${domain.border} ${domain.bg} backdrop-blur-sm transition hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${domain.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{domain.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {domain.techs.map((tech, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-white/60 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROJETS EN COURS */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <RocketLaunchIcon className="h-4 w-4" />
              Ce que nous construisons
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              DIGICOL est une communauté de <span className="text-blue-600">builders</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des projets concrets en cours de développement
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'DevGuard', icon: ShieldCheckIcon, tech: 'Cybersécurité' },
              { name: 'Applications mobiles', icon: BuildingLibraryIcon, tech: 'React Native' },
              { name: 'Plateformes Web', icon: CodeBracketSquareIcon, tech: 'React - Django' },
              { name: 'Projets IA', icon: CpuChipIcon, tech: 'Python - ML' },
              { name: 'Infrastructure Cloud', icon: CloudIcon, tech: 'AWS - Docker' },
              { name: 'Labs Cybersécurité', icon: ShieldCheckIcon, tech: 'Pentest - SOC' },
            ].map((project, index) => {
              const Icon = project.icon;
              return (
                <div 
                  key={index}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center hover:shadow-lg transition hover:-translate-y-1"
                >
                  <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-slate-900">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.tech}</p>
                  <div className="mt-3 flex justify-center gap-3 text-xs text-blue-600">
                    <span className="cursor-pointer hover:underline">GitHub</span>
                    <span className="cursor-pointer hover:underline">Démo</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
            >
              Voir tous les projets
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COMMUNAUTÉ */}
      {/* ============================================ */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <BackgroundGlow className="top-0 right-0 w-96 h-96 bg-purple-500 opacity-20" />
        <BackgroundGlow className="bottom-0 left-0 w-96 h-96 bg-cyan-500 opacity-20" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-400/30">
            <UserGroupIcon className="h-4 w-4" />
            Communauté
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Construisons ensemble.
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Chez DIGICOL, tu n'apprends jamais seul.<br />
            Tu rencontres d'autres développeurs, tu travailles sur des projets,
            tu poses tes questions, tu partages tes connaissances et tu construis ton réseau.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-lg font-medium transition shadow-xl"
          >
            Rejoindre la communauté
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* ACTIVITÉS À VENIR */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <CalendarIcon className="h-4 w-4" />
              Cette semaine chez DIGICOL
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Une communauté vivante
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {UPCOMING_EVENTS.map((event, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {event.day}
                  </span>
                  <span className="font-medium text-slate-900">{event.title}</span>
                </div>
                <span className="text-sm text-gray-500">{event.time}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
            >
              Voir tous les événements
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CHALLENGES */}
      {/* ============================================ */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <BackgroundGlow className="top-0 left-0 w-96 h-96 bg-blue-500 opacity-10" />
        <BackgroundGlow className="bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-10" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-orange-500/30">
            <LightBulbIcon className="h-4 w-4" />
            Ton prochain défi commence ici
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-12">
            Challenges
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CHALLENGES.map((challenge, index) => {
              const Icon = challenge.icon;
              return (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${challenge.color} text-white text-center hover:scale-105 transition shadow-xl`}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold text-sm">{challenge.title}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-lg font-medium border border-white/20 transition backdrop-blur-sm"
            >
              Participer à un challenge
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FORMATIONS */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <AcademicCapIcon className="h-4 w-4" />
              Nos parcours
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Une partie de l'écosystème DIGICOL
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des formations qui te préparent aux défis du monde professionnel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Python & Django', icon: CodeBracketIcon, color: 'from-blue-500 to-blue-600' },
              { name: 'React & API', icon: CodeBracketSquareIcon, color: 'from-cyan-500 to-cyan-600' },
              { name: 'Docker & DevOps', icon: CloudIcon, color: 'from-orange-500 to-orange-600' },
              { name: 'React Native', icon: BuildingLibraryIcon, color: 'from-green-500 to-green-600' },
              { name: 'Machine Learning', icon: CpuChipIcon, color: 'from-purple-500 to-purple-600' },
              { name: 'Cybersécurité', icon: ShieldCheckIcon, color: 'from-red-500 to-red-600' },
            ].map((course, index) => {
              const Icon = course.icon;
              return (
                <div 
                  key={index}
                  className="group bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-xl transition hover:-translate-y-1 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${course.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-slate-900">{course.name}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
            >
              Voir toutes les formations
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* GITHUB / OPEN SOURCE */}
      {/* ============================================ */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <BackgroundGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500 opacity-10" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-700/50 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-slate-600">
            <CodeBracketIcon className="h-4 w-4" />
            Open Source
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Nous construisons en <span className="text-blue-400">public</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Découvre notre GitHub, nos projets open source, nos contributions
            et les technologies que nous utilisons.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {['GitHub', 'Repositories', 'Contributions', 'Open Source'].map((item) => (
              <span key={item} className="px-4 py-2 bg-slate-800 text-gray-300 rounded-full text-sm border border-slate-700">
                {item}
              </span>
            ))}
          </div>

          <Link
            href="https://github.com/digicol"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-lg font-medium border border-white/20 transition backdrop-blur-sm"
          >
            Explorer notre GitHub
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* TÉMOIGNAGES */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <StarIcon className="h-4 w-4" />
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Ils ont rejoint DIGICOL
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                quote: 'DIGICOL m\'a permis de passer de la théorie à la réalisation de vrais projets.', 
                name: 'Jean K.', 
                role: 'Développeur Full Stack' 
              },
              { 
                quote: 'La communauté est incroyable. On apprend ensemble et on se tire vers le haut.', 
                name: 'Marie L.', 
                role: 'Data Scientist' 
              },
              { 
                quote: 'J\'ai déjà participé à des ateliers pratiques qui m\'ont beaucoup appris.', 
                name: 'David T.', 
                role: 'Étudiant en Cybersécurité' 
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(5).split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">« {testimonial.quote} »</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Témoignages réels de membres de la communauté
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* PARTENAIRES */}
      {/* ============================================ */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Ils construisent avec nous
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {['Communautés locales', 'Universités', 'Entreprises tech'].map((partner) => (
              <span key={partner} className="text-lg font-medium text-gray-500 hover:text-gray-700 transition">
                {partner}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Partenariats en cours de développement
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* VISION — AMBITION */}
      {/* ============================================ */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <BackgroundGlow className="top-0 right-0 w-96 h-96 bg-blue-500 opacity-10" />
        <BackgroundGlow className="bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-10" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center gap-2 text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              Made in Cameroon
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Built for Africa
            </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connected to the World
            </span>
          </div>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Notre ambition est de créer une communauté technologique camerounaise 
            capable de collaborer avec les plus grands écosystèmes technologiques mondiaux.
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 relative overflow-hidden">
        <BackgroundGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 opacity-20" />
        <AnimatedGrid />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Tu veux construire la technologie de demain ?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Ne reste pas spectateur.<br />
            <span className="text-blue-400 font-bold">Rejoins DIGICOL. Construisons ensemble.</span>
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-medium transition shadow-lg shadow-blue-600/30"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Rejoindre DIGICOL
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-lg font-medium border border-white/20 transition backdrop-blur-sm"
            >
              <FolderIcon className="h-5 w-5" />
              Voir nos projets
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-slate-950 text-gray-400 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            
            <div>
              <Logo invert className="mb-4" />
              <p className="text-sm text-gray-500">Apprendre · Construire · Partager</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-gray-500 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.08 20.31H3.55V8.97h3.53v11.34zM5.31 7.42a2.04 2.04 0 1 1 0-4.08 2.04 2.04 0 0 1 0 4.08zm15.03 12.89h-3.53v-5.6c0-1.34-.03-3.06-1.86-3.06s-2.15 1.45-2.15 2.95v5.71H9.27V8.97h3.39v1.56h.05c.47-.89 1.61-1.83 3.33-1.83 3.56 0 4.22 2.34 4.22 5.38v6.23z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> À propos
                </Link></li>
                <li><Link href="/courses" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> Formations
                </Link></li>
                <li><Link href="/projects" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> Projets
                </Link></li>
                <li><Link href="/events" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> Événements
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Communauté</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/community" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> Membres
                </Link></li>
                <li><Link href="/challenges" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> Challenges
                </Link></li>
                <li><Link href="/opportunities" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> Opportunités
                </Link></li>
                <li><Link href="/github" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" /> GitHub
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span>Douala, Cameroun</span>
                </li>
                <li className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <a href="mailto:contact@digicol.com" className="hover:text-white transition">
                    contact@digicol.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <a href="tel:+237671628735" className="hover:text-white transition">
                    +237 671 628 735
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-sm text-gray-600">
            <p>© 2026 DigiCol — Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}