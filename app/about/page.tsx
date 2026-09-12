// app/about/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpenIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  LightBulbIcon,
  GlobeAltIcon,
  TrophyIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  HeartIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

// ============================================
// DATA
// ============================================

const PILLARS = [
  {
    icon: BookOpenIcon,
    title: 'Apprendre',
    description: 'Des formations pratiques et des ressources adaptées aux besoins réels du marché.',
    color: 'blue',
  },
  {
    icon: UserGroupIcon,
    title: 'Partager',
    description: 'Une communauté active où l\'entraide, le partage et la bienveillance sont au cœur.',
    color: 'green',
  },
  {
    icon: RocketLaunchIcon,
    title: 'Innover',
    description: 'Des projets concrets qui répondent à des problèmes réels et créent de la valeur.',
    color: 'orange',
  },
];

const VALUES = [
  {
    icon: TrophyIcon,
    title: 'Excellence',
    description: 'Nous visons la qualité dans tout ce que nous faisons, du contenu à l\'accompagnement.',
  },
  {
    icon: UserGroupIcon,
    title: 'Collaboration',
    description: 'Ensemble, nous allons plus loin. Le partage de connaissances est notre force.',
  },
  {
    icon: LightBulbIcon,
    title: 'Innovation',
    description: 'Nous explorons les technologies de demain et encourageons la créativité.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Inclusion',
    description: 'La tech est pour tout le monde. Nous rendons le numérique accessible à tous.',
  },
];

const STATS = [
  { value: '120+', label: 'Membres', icon: UserGroupIcon },
  { value: '8', label: 'Projets en cours', icon: FolderIcon },
  { value: '6', label: 'Ateliers réalisés', icon: AcademicCapIcon },
  { value: '8', label: 'Technologies', icon: CodeBracketIcon },
];

const TEAM_VALUES = [
  {
    title: 'Notre vision',
    description: 'Devenir la référence technologique en Afrique centrale, en formant une nouvelle génération de talents capables de construire des solutions innovantes.',
    icon: RocketLaunchIcon,
  },
  {
    title: 'Notre mission',
    description: 'Accompagner les jeunes talents du numérique en offrant une plateforme d\'apprentissage, de collaboration et d\'opportunités professionnelles.',
    icon: HeartIcon,
  },
  {
    title: 'Notre engagement',
    description: 'Fournir des formations de qualité, accessibles et en phase avec les besoins du marché, tout en créant une communauté soudée et bienveillante.',
    icon: ShieldCheckIcon,
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* HERO - SANS STATS */}
      {/* ============================================ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
            <SparklesIcon className="h-4 w-4" />
            Notre histoire
          </div>

          <Image
            src="/logo.png"
            alt="DigiCol"
            width={200}
            height={70}
            className="h-auto w-auto mx-auto mb-6 brightness-0 invert"
          />

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            À propos de <span className="text-blue-400">DigiCol</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Une communauté technologique camerounaise dédiée à l'apprentissage,
            au partage et à l'innovation dans le numérique.
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* STATS - UNE SEULE FOIS */}
      {/* ============================================ */}
      <section className="py-12 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index}>
                  <div className="flex justify-center mb-3">
                    <Icon className="h-8 w-8 text-blue-200" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm text-blue-100 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MISSION */}
      {/* ============================================ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <HeartIcon className="h-4 w-4" />
              Notre mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Construire les talents de demain
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              DigiCol est une communauté technologique dédiée à l'apprentissage, au partage
              et à l'innovation dans le numérique. Nous accompagnons les étudiants,
              jeunes diplômés, développeurs et passionnés d'informatique dans leur
              parcours professionnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((item, index) => {
              const Icon = item.icon;
              const colors = colorClasses[item.color];
              return (
                <div
                  key={index}
                  className={`text-center p-8 rounded-2xl ${colors.bg} border ${colors.border} hover:shadow-lg transition hover:-translate-y-1`}
                >
                  <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 border ${colors.border}`}>
                    <Icon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VISION / MISSION / ENGAGEMENT */}
      {/* ============================================ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <ChartBarIcon className="h-4 w-4" />
              Qui sommes-nous
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Notre identité
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM_VALUES.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VALEURS */}
      {/* ============================================ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <StarIcon className="h-4 w-4" />
              Nos valeurs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ce qui nous guide
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Les principes qui animent chaque action de la communauté DigiCol
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition"
                >
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOMAINES */}
      {/* ============================================ */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-blue-500/30">
              <CodeBracketIcon className="h-4 w-4" />
              Nos domaines
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Un écosystème complet
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nous couvrons l'ensemble des technologies du numérique
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Web & Mobile',
              'Cloud & DevOps',
              'Cybersécurité',
              'Intelligence Artificielle',
              'Data Science',
              'Linux & Réseaux',
              'Blockchain',
              'Design UI/UX',
            ].map((domain, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition"
              >
                <CheckCircleIcon className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">{domain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA CONTACT */}
      {/* ============================================ */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Rejoignez l'aventure DigiCol
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Faites partie de la communauté technologique qui construit l'avenir du numérique au Cameroun.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-lg font-medium transition shadow-lg"
            >
              <UserGroupIcon className="h-5 w-5" />
              Créer mon compte
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-lg font-medium border border-white/20 transition backdrop-blur-sm"
            >
              <EnvelopeIcon className="h-5 w-5" />
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER INFO */}
      {/* ============================================ */}
      <section className="py-12 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <MapPinIcon className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium text-sm">Adresse</p>
                <p className="text-gray-400 text-sm">Douala, Cameroun</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <EnvelopeIcon className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium text-sm">Email</p>
                <a href="mailto:contact@digicol.com" className="text-gray-400 text-sm hover:text-blue-400 transition">
                  contact@digicol.com
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <PhoneIcon className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium text-sm">Téléphone</p>
                <a href="tel:+237671628735" className="text-gray-400 text-sm hover:text-blue-400 transition">
                  +237 671 628 735
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}