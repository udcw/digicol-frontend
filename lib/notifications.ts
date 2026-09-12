// lib/notifications.ts

import { supabase } from './supabase';

export type NotificationType =
  | 'PROJECT_ENROLLMENT'
  | 'PROJECT_APPROVED'
  | 'COMMENT'
  | 'CERTIFICATE'
  | 'EVENT'
  | 'OPPORTUNITY'
  | 'BADGE';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: CreateNotificationParams) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link: link || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur création notification:', error);
    return { data: null, error };
  }
}

// Fonctions utilitaires
export async function notifyProjectEnrollment(userId: string, projectTitle: string, projectSlug: string) {
  return createNotification({
    userId,
    title: 'Nouvelle inscription au projet',
    message: `Un membre souhaite rejoindre le projet "${projectTitle}".`,
    type: 'PROJECT_ENROLLMENT',
    link: `/projects/${projectSlug}`,
  });
}

export async function notifyProjectApproved(userId: string, projectTitle: string, projectSlug: string) {
  return createNotification({
    userId,
    title: 'Inscription approuvée',
    message: `Votre inscription au projet "${projectTitle}" a été approuvée.`,
    type: 'PROJECT_APPROVED',
    link: `/projects/${projectSlug}`,
  });
}

export async function notifyNewComment(userId: string, authorName: string, postId: string) {
  return createNotification({
    userId,
    title: 'Nouveau commentaire',
    message: `${authorName} a commenté votre publication.`,
    type: 'COMMENT',
    link: `/community`,
  });
}

export async function notifyNewBadge(userId: string, badgeName: string) {
  return createNotification({
    userId,
    title: 'Nouveau badge obtenu',
    message: `Félicitations ! Vous avez obtenu le badge "${badgeName}".`,
    type: 'BADGE',
    link: `/profile`,
  });
}

export async function notifyCertificateIssued(userId: string, certificateTitle: string, certificateNumber: string) {
  return createNotification({
    userId,
    title: 'Certificat disponible',
    message: `Votre certificat "${certificateTitle}" est disponible.`,
    type: 'CERTIFICATE',
    link: `/verify/certificate/${certificateNumber}`,
  });
}