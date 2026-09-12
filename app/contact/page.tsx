// app/contact/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  UsersIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

// ============================================
// DATA
// ============================================

const CONTACT_INFO = [
  {
    icon: MapPinIcon,
    title: 'Adresse',
    value: 'Douala, Cameroun',
    link: null,
    color: 'blue',
  },
  {
    icon: EnvelopeIcon,
    title: 'Email',
    value: 'contact@digicol.com',
    link: 'mailto:contact@digicol.com',
    color: 'green',
  },
  {
    icon: PhoneIcon,
    title: 'Téléphone',
    value: '+237 671 628 735',
    link: 'tel:+237671628735',
    color: 'purple',
  },
  {
    icon: ClockIcon,
    title: 'Horaires',
    value: 'Lun - Ven : 8h - 18h',
    link: null,
    color: 'orange',
  },
];

const SUBJECTS = [
  { value: 'general', label: 'Question générale' },
  { value: 'formation', label: 'Formations' },
  { value: 'projet', label: 'Projets' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'support', label: 'Support technique' },
  { value: 'autre', label: 'Autre' },
];

const FAQ_SUGGESTIONS = [
  { question: 'Comment rejoindre DigiCol ?', href: '/faq' },
  { question: 'Quelles formations proposez-vous ?', href: '/faq' },
  { question: 'Comment participer à un projet ?', href: '/faq' },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simuler l'envoi
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setFormData({ name: '', email: '', subject: 'general', message: '' });
      setTimeout(() => setSent(false), 5000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6 border border-blue-500/30">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Une question ? Une suggestion ? Notre équipe vous répond dans les plus brefs délais.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* ============================================ */}
        {/* CARTES DE CONTACT */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CONTACT_INFO.map((info, index) => {
            const Icon = info.icon;
            const colors = colorClasses[info.color];
            return (
              <div
                key={index}
                className={`bg-white p-5 rounded-xl shadow-sm border ${colors.border} hover:shadow-md transition text-center`}
              >
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-sm">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-gray-600 text-xs hover:text-blue-600 transition break-all"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-gray-600 text-xs">{info.value}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* ============================================ */}
        {/* FORMULAIRE + FAQ */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Envoyez-nous un message
                </h2>
                <p className="text-gray-500 text-sm">
                  Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                </p>
              </div>

              {sent && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Message envoyé avec succès !</p>
                    <p className="text-xs">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Décrivez votre demande en détail..."
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.message.length} caractères
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-400">
                    * Champs obligatoires
                  </p>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - FAQ et liens */}
          <div className="space-y-6">
            {/* FAQ suggestions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Questions fréquentes</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Votre question a peut-être déjà une réponse.
              </p>
              <ul className="space-y-2">
                {FAQ_SUGGESTIONS.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="flex items-start gap-2 text-sm text-gray-600 hover:text-blue-600 transition group"
                    >
                      <ArrowRightIcon className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition" />
                      {item.question}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-4 font-medium"
              >
                Voir toutes les FAQ
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Liens rapides */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-900 mb-4">Liens rapides</h3>
              <div className="space-y-3">
                <Link
                  href="/courses"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition group"
                >
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                    <BookOpenIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Formations</p>
                    <p className="text-xs text-gray-500">Découvrir les cours</p>
                  </div>
                </Link>
                <Link
                  href="/projects"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition group"
                >
                  <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition">
                    <BuildingOfficeIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Projets</p>
                    <p className="text-xs text-gray-500">Voir les projets</p>
                  </div>
                </Link>
                <Link
                  href="/community"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition group"
                >
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition">
                    <UsersIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Communauté</p>
                    <p className="text-xs text-gray-500">Rejoindre la discussion</p>
                  </div>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition group"
                >
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
                    <GlobeAltIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">À propos</p>
                    <p className="text-xs text-gray-500">Notre histoire</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Info temps de réponse */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white">
              <ClockIcon className="h-8 w-8 mb-3 text-blue-200" />
              <h3 className="font-bold mb-2">Temps de réponse</h3>
              <p className="text-sm text-blue-100">
                Nous répondons généralement dans les 24 à 48 heures ouvrées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}