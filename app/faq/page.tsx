// app/faq/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  BookOpenIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const FAQ_DATA = [
  {
    id: 'general',
    category: 'Général',
    icon: QuestionMarkCircleIcon,
    color: 'blue',
    questions: [
      {
        question: 'Qu\'est-ce que DigiCol ?',
        answer: 'DigiCol est une communauté technologique camerounaise dédiée à l\'apprentissage, au partage et à l\'innovation dans le numérique. Nous proposons des formations, des projets collaboratifs, des événements et des opportunités professionnelles.',
      },
      {
        question: 'Comment rejoindre DigiCol ?',
        answer: 'Il suffit de créer un compte gratuitement sur notre plateforme. Une fois inscrit, vous recevrez votre identifiant DigiCol unique et pourrez accéder à toutes les fonctionnalités de la communauté.',
      },
      {
        question: 'Est-ce que DigiCol est gratuit ?',
        answer: 'L\'inscription et l\'accès à la communauté sont gratuits. Certaines formations avancées et événements premium peuvent être payants, mais nous proposons régulièrement des contenus gratuits et des bourses.',
      },
      {
        question: 'Qui peut rejoindre DigiCol ?',
        answer: 'DigiCol est ouvert à tous : étudiants, jeunes diplômés, développeurs, passionnés d\'informatique et professionnels du numérique. Aucun prérequis n\'est exigé pour rejoindre la communauté.',
      },
    ],
  },
  {
    id: 'formations',
    category: 'Formations',
    icon: BookOpenIcon,
    color: 'purple',
    questions: [
      {
        question: 'Quelles formations proposez-vous ?',
        answer: 'Nous couvrons un large spectre : Python & Django, React & Next.js, Développement Mobile, Intelligence Artificielle, Data Science, Cybersécurité, DevOps, Cloud, Linux et bien plus encore.',
      },
      {
        question: 'Les formations sont-elles certifiantes ?',
        answer: 'Oui, la plupart de nos formations délivrent un certificat numérique vérifiable avec QR Code. Ce certificat est reconnu par notre réseau de partenaires.',
      },
      {
        question: 'Comment se déroulent les formations ?',
        answer: 'Nos formations sont 100% en ligne, avec des sessions live, des ateliers pratiques, des projets concrets et un accompagnement personnalisé. Vous avez accès aux replays et supports PDF.',
      },
      {
        question: 'Puis-je suivre plusieurs formations en même temps ?',
        answer: 'Absolument ! Vous pouvez vous inscrire à autant de formations que vous le souhaitez. Nous vous recommandons cependant de suivre 1 à 2 formations en parallèle pour bien assimiler les contenus.',
      },
    ],
  },
  {
    id: 'projets',
    category: 'Projets & Communauté',
    icon: RocketLaunchIcon,
    color: 'orange',
    questions: [
      {
        question: 'Comment participer à un projet ?',
        answer: 'Parcourez la liste des projets, choisissez celui qui vous intéresse et cliquez sur "Rejoindre le projet". Une fois approuvé par l\'administrateur, vous pourrez contribuer via GitHub.',
      },
      {
        question: 'Puis-je proposer mon propre projet ?',
        answer: 'Absolument ! DigiCol encourage les initiatives. Vous pouvez créer un projet depuis votre tableau de bord et recruter des membres pour vous aider.',
      },
      {
        question: 'Comment obtenir des badges ?',
        answer: 'Les badges sont décernés automatiquement en fonction de votre activité : formations terminées, projets réalisés, contributions communautaires, etc.',
      },
      {
        question: 'Comment contacter les autres membres ?',
        answer: 'Rendez-vous sur la page Communauté pour interagir avec les autres membres. Vous pouvez également participer aux discussions dans la section commentaires des publications.',
      },
    ],
  },
  {
    id: 'compte',
    category: 'Compte & Profil',
    icon: UserGroupIcon,
    color: 'green',
    questions: [
      {
        question: 'Comment obtenir mon identifiant DigiCol ?',
        answer: 'Votre identifiant DigiCol (au format DIGICOL-MEM-XXXX-XXXX) est généré automatiquement lors de votre inscription. Vous le trouverez sur votre carte de membre numérique.',
      },
      {
        question: 'Ma carte de membre est-elle vérifiable ?',
        answer: 'Oui, chaque carte de membre possède un QR Code qui permet de vérifier votre identité DigiCol sur une page publique dédiée.',
      },
      {
        question: 'Comment modifier mes informations personnelles ?',
        answer: 'Rendez-vous dans votre Profil depuis votre tableau de bord. Vous pouvez y modifier votre nom, téléphone, ville, compétences et bio.',
      },
      {
        question: 'Comment réinitialiser mon mot de passe ?',
        answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions envoyées par email pour réinitialiser votre mot de passe.',
      },
    ],
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hover: 'hover:bg-blue-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', hover: 'hover:bg-purple-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', hover: 'hover:bg-orange-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', hover: 'hover:bg-green-100' },
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  // Filtrer les questions selon la recherche
  const filteredData = FAQ_DATA.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const currentCategory = filteredData.find(c => c.id === activeCategory) || filteredData[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6 border border-blue-500/30">
            <QuestionMarkCircleIcon className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Questions fréquentes
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Trouvez rapidement des réponses à vos questions sur DigiCol
          </p>

          {/* Barre de recherche */}
          <div className="max-w-xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {searchQuery ? (
          // Résultats de recherche
          <div>
            <p className="text-sm text-gray-500 mb-6">
              {filteredData.reduce((sum, cat) => sum + cat.questions.length, 0)} résultat(s) pour "{searchQuery}"
            </p>
            <div className="space-y-6">
              {filteredData.map((category) => (
                <div key={category.id}>
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <category.icon className={`h-5 w-5 ${colorClasses[category.color].text}`} />
                    {category.category}
                  </h2>
                  <div className="space-y-3">
                    {category.questions.map((item, qIndex) => {
                      const key = `${category.id}-${qIndex}`;
                      const isOpen = openIndex === key;
                      return (
                        <div
                          key={key}
                          className={`bg-white rounded-xl border ${
                            isOpen ? colorClasses[category.color].border : 'border-gray-100'
                          } overflow-hidden transition-all`}
                        >
                          <button
                            onClick={() => toggleQuestion(key)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                          >
                            <span className="font-medium text-slate-900 pr-4">{item.question}</span>
                            {isOpen ? (
                              <ChevronUpIcon className={`h-5 w-5 ${colorClasses[category.color].text} flex-shrink-0`} />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {filteredData.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <QuestionMarkCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Aucun résultat pour "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:underline mt-2 text-sm"
                >
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>
        ) : (
          // Affichage normal avec onglets
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Catégories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                  Catégories
                </h3>
                <nav className="space-y-1">
                  {FAQ_DATA.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    const colors = colorClasses[category.color];
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setOpenIndex(null);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                          isActive
                            ? `${colors.bg} ${colors.text}`
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{category.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/60' : 'bg-gray-100'
                        }`}>
                          {category.questions.length}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Contact CTA */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/contact"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Contacter le support
                  </Link>
                </div>
              </div>
            </div>

            {/* Contenu - Questions */}
            <div className="lg:col-span-3">
              {currentCategory && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${colorClasses[currentCategory.color].bg}`}>
                        <currentCategory.icon className={`h-5 w-5 ${colorClasses[currentCategory.color].text}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {currentCategory.category}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      {currentCategory.questions.length} question{currentCategory.questions.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentCategory.questions.map((item, qIndex) => {
                      const key = `${currentCategory.id}-${qIndex}`;
                      const isOpen = openIndex === key;
                      const colors = colorClasses[currentCategory.color];
                      return (
                        <div
                          key={key}
                          className={`bg-white rounded-xl border transition-all ${
                            isOpen
                              ? `${colors.border} shadow-md`
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => toggleQuestion(key)}
                            className="w-full flex items-center justify-between p-5 text-left"
                          >
                            <span className="font-medium text-slate-900 pr-4">
                              {item.question}
                            </span>
                            <div className={`p-1 rounded-full ${isOpen ? colors.bg : 'bg-gray-100'} flex-shrink-0`}>
                              {isOpen ? (
                                <ChevronUpIcon className={`h-4 w-4 ${colors.text}`} />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* CTA CONTACT */}
        {/* ============================================ */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <EnvelopeIcon className="h-12 w-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-blue-100 mb-6">
            Notre équipe est là pour vous aider.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition shadow-lg"
          >
            Contactez-nous
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* ============================================ */}
        {/* LIENS RAPIDES */}
        {/* ============================================ */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/courses"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition group"
          >
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Formations</p>
              <p className="text-xs text-gray-500">Découvrir les cours</p>
            </div>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition group"
          >
            <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition">
              <RocketLaunchIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Projets</p>
              <p className="text-xs text-gray-500">Voir les projets</p>
            </div>
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition group"
          >
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition">
              <UserGroupIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Communauté</p>
              <p className="text-xs text-gray-500">Rejoindre la discussion</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}