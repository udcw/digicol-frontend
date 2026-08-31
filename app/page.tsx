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
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-8">
              <Image
                src="/logo.png"
                alt="DigiCol"
                width={220}
                height={80}
                className="h-auto w-auto"
                priority
              />
            </div>

            <div className="inline-block bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
              Communauté Technologique
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-blue-400">APPRENDRE</span>
              <span className="text-white mx-3">·</span>
              <span className="text-blue-400">PARTAGER</span>
              <span className="text-white mx-3">·</span>
              <span className="text-blue-400">INNOVER</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Une communauté technologique pour apprendre, pratiquer,
              construire des projets et développer les compétences nécessaires
              aux métiers du numérique.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition shadow-lg shadow-blue-600/30"
              >
                Rejoindre DigiCol
              </Link>
              <Link
                href="/courses"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium border border-white/20 transition"
              >
                Découvrir les programmes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Image src="/logo.png" alt="DigiCol" width={150} height={50} className="h-auto w-auto" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi DigiCol ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour votre développement professionnel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Apprendre',
                description: 'Développez vos compétences grâce à des formations et ressources adaptées.',
                icon: BookOpenIcon,
              },
              {
                title: 'Pratiquer',
                description: 'Mettez immédiatement vos connaissances en application avec des projets concrets.',
                icon: RocketLaunchIcon,
              },
              {
                title: 'Partager',
                description: 'Échangez avec d\'autres passionnés et développeurs dans une communauté dynamique.',
                icon: UserGroupIcon,
              },
              {
                title: 'Innover',
                description: 'Créez des solutions répondant à des problèmes réels.',
                icon: LightBulbIcon,
              },
              {
                title: 'Construire son portfolio',
                description: 'Développez des projets concrets et valorisables professionnellement.',
                icon: FolderIcon,
              },
              {
                title: 'Accéder aux opportunités',
                description: 'Découvrez des stages, missions, emplois et collaborations.',
                icon: BriefcaseIcon,
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition hover:-translate-y-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez DigiCol et commencez votre parcours vers les métiers du numérique.
          </p>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-medium inline-block transition shadow-lg shadow-blue-600/30"
          >
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image src="/logo.png" alt="DigiCol" width={140} height={45} className="h-auto w-auto mb-4" />
              <p className="text-sm text-gray-500">Apprendre · Partager · Innover</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Liens</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">À propos</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Formations</Link></li>
                <li><Link href="/projects" className="hover:text-white transition">Projets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Communauté</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/community" className="hover:text-white transition">Membres</Link></li>
                <li><Link href="/events" className="hover:text-white transition">Événements</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Douala, Cameroun</li>
                <li>contact@digicol.com</li>
                <li>+237 671 628 735</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            © 2026 DigiCol — Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}