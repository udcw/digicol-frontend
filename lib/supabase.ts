// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TYPES
// ============================================

export type User = {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  avatar: string | null;
  city: string | null;
  study_level: string | null;
  domain: string | null;
  skills: string | null;
  bio: string | null;
  role: string;
  status: string;
  is_superadmin: boolean;
  is_active: boolean;
  is_verified: boolean;
  digicol_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
};

export type Course = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  level: string;
  duration: string | null;
  program: string | null;
  prerequisites: string | null;
  price: number;
  available_seats: number;
  is_published: boolean;
  category_id: number | null;
  instructor_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  instructor?: User;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  technologies: string | null;
  image: string | null;
  github_url: string | null;
  demo_url: string | null;
  status: string;
  created_by: string | null;
  team: any[];
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  image: string | null;
  author_id: string | null;
  tags: string[];
  is_published: boolean;
  view_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: User;
};

export type Event = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  location: string | null;
  address: string | null;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  max_participants: number;
  current_participants: number;
  price: number;
  is_free: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
};

export type EventRegistration = {
  id: number;
  event_id: number;
  user_id: string;
  registration_date: string;
  is_confirmed: boolean;
  attended: boolean;
  event?: Event;
  user?: User;
};

export type Certificate = {
  id: number;
  certificate_id: string;
  user_id: string;
  course_id: number | null;
  enrollment_id: number | null;
  issue_date: string;
  expiry_date: string | null;
  file_url: string | null;
  qr_code: string | null;
  is_verified: boolean;
  created_at: string;
  user?: User;
  course?: Course;
};

export type Opportunity = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  requirements: string | null;
  opportunity_type: string | null;
  location: string | null;
  is_remote: boolean;
  company: string | null;
  contact_email: string | null;
  deadline: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
};

export type Enrollment = {
  id: number;
  user_id: string;
  course_id: number;
  status: string;
  enrollment_date: string;
  completion_date: string | null;
  certificate_id: number | null;
  user?: User;
  course?: Course;
  certificate?: Certificate;
};

export type CommunityPost = {
  id: number;
  user_id: string;
  content: string;
  image: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
  user?: User;
};

export type CommunityComment = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
  post?: CommunityPost;
};

export type Notification = {
  id: number;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  user?: User;
};

export type Announcement = {
  id: number;
  title: string;
  content: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
  creator?: User;
};

export type Wallet = {
  id: number;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  user?: User;
};

export type Transaction = {
  id: number;
  wallet_id: number;
  amount: number;
  type: string;
  description: string | null;
  status: string;
  reference: string | null;
  created_at: string;
  completed_at: string | null;
  wallet?: Wallet;
};

// ============================================
// AUTH
// ============================================

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// ============================================
// USERS
// ============================================

export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  return { data, error };
};

export const getUser = async (id: string) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  return { data, error };
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
  return { data, error };
};

// ============================================
// ADMIN - MEMBRES
// ============================================

export const updateMemberStatus = async (userId: string, status: string) => {
  const isActive = status === 'active' || status === 'verified';
  const isVerified = status === 'verified';
  const { data, error } = await supabase
    .from('users')
    .update({ status, is_active: isActive, is_verified: isVerified, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const toggleMemberStatus = async (userId: string) => {
  const { data: user } = await supabase.from('users').select('status').eq('id', userId).single();
  const newStatus = user?.status === 'active' ? 'inactive' : 'active';
  return updateMemberStatus(userId, newStatus);
};

export const changeMemberRole = async (userId: string, role: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const deleteMember = async (userId: string) => {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  return { error };
};

export const getAdminStats = async () => {
  try {
    const [users, courses, projects, certificates, events, opportunities, blog, community] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
    ]);
    return {
      data: {
        users: users.count || 0,
        courses: courses.count || 0,
        projects: projects.count || 0,
        certificates: certificates.count || 0,
        events: events.count || 0,
        opportunities: opportunities.count || 0,
        blog: blog.count || 0,
        community: community.count || 0,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

export const isUserAdmin = async (userId: string) => {
  const { data, error } = await supabase.from('users').select('role, is_superadmin').eq('id', userId).single();
  if (error || !data) return { isAdmin: false, error };
  return {
    isAdmin: data.role === 'SUPER_ADMIN' || data.role === 'ADMIN' || data.is_superadmin === true,
    role: data.role,
    error: null,
  };
};

// ============================================
// COURSES
// ============================================

export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*, category:categories(*), instructor:users(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*, category:categories(*), instructor:users(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getCourse = async (slug: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*, category:categories(*), instructor:users(*)')
    .eq('slug', slug)
    .single();
  return { data, error };
};

export const createCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase.from('courses').insert(course).select().single();
  return { data, error };
};

export const updateCourse = async (id: number, updates: Partial<Course>) => {
  const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
  return { data, error };
};

export const deleteCourse = async (id: number) => {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  return { error };
};

// ============================================
// CATEGORIES
// ============================================

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  return { data, error };
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  return { data, error };
};

// ============================================
// PROJECTS
// ============================================

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, creator:users(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getAllProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, creator:users(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getProject = async (slug: string) => {
  const { data, error } = await supabase.from('projects').select('*, creator:users(*)').eq('slug', slug).single();
  return { data, error };
};

export const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase.from('projects').insert(project).select().single();
  return { data, error };
};

// ============================================
// BLOG
// ============================================

export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:users(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getAllBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:users(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getBlogPost = async (slug: string) => {
  const { data, error } = await supabase.from('blog_posts').select('*, author:users(*)').eq('slug', slug).single();
  return { data, error };
};

export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count'>) => {
  const { data, error } = await supabase.from('blog_posts').insert(post).select().single();
  return { data, error };
};

// ============================================
// EVENTS
// ============================================

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*, creator:users(*)')
    .eq('is_published', true)
    .order('start_date', { ascending: true });
  return { data, error };
};

export const getAllEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*, creator:users(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getEvent = async (slug: string) => {
  const { data, error } = await supabase.from('events').select('*, creator:users(*)').eq('slug', slug).single();
  return { data, error };
};

export const registerForEvent = async (eventId: number, userId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, user_id: userId })
    .select()
    .single();
  return { data, error };
};

// ============================================
// OPPORTUNITIES
// ============================================

export const getOpportunities = async () => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, creator:users(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getOpportunity = async (slug: string) => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, creator:users(*)')
    .eq('slug', slug)
    .single();
  return { data, error };
};

// ============================================
// ENROLLMENTS
// ============================================

export const enrollInCourse = async (userId: string, courseId: number) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single();
  return { data, error };
};

export const getEnrollments = async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*), certificate:certificates(*)')
    .eq('user_id', userId);
  return { data, error };
};

// ============================================
// CERTIFICATES
// ============================================

export const getCertificates = async (userId: string) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, course:courses(*), user:users(*)')
    .eq('user_id', userId);
  return { data, error };
};

export const getAllCertificates = async () => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, user:users(*), course:courses(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const generateCertificate = async (enrollmentId: number) => {
  const { data, error } = await supabase
    .from('certificates')
    .insert({ enrollment_id: enrollmentId, certificate_id: `CERT-${Date.now()}` })
    .select()
    .single();
  return { data, error };
};

// ============================================
// COMMUNITY
// ============================================

export const getCommunityPosts = async () => {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCommunityPost = async (userId: string, content: string, image?: string) => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({ user_id: userId, content, image })
    .select()
    .single();
  return { data, error };
};

export const addComment = async (postId: number, userId: string, content: string) => {
  const { data, error } = await supabase
    .from('community_comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single();
  return { data, error };
};

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const markNotificationRead = async (id: number) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ============================================
// WALLET & TRANSACTIONS
// ============================================

export const getWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*, transactions:transactions(*)')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const createTransaction = async (walletId: number, amount: number, type: string, description?: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ wallet_id: walletId, amount, type, description, reference: `TXN-${Date.now()}` })
    .select()
    .single();
  return { data, error };
};

export const getMemberBadges = async (userId: string) => {
  const { data, error } = await supabase
    .from('member_badges')
    .select('badges(*)')
    .eq('member_id', userId);
  return { data, error };
};

export const awardBadge = async (userId: string, badgeSlug: string) => {
  // Récupérer le badge
  const { data: badge } = await supabase
    .from('badges')
    .select('id')
    .eq('slug', badgeSlug)
    .single();

  if (!badge) return { error: new Error('Badge not found') };

  const { data, error } = await supabase
    .from('member_badges')
    .insert({ member_id: userId, badge_id: badge.id })
    .select()
    .single();

  return { data, error };
};

// ============================================
// CERTIFICATS
// ============================================

export const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CERT-DIGICOL-${year}-${random}`;
};

export const createCertificate = async (
  memberId: string,
  courseId: number,
  title: string
) => {
  const certificateNumber = generateCertificateNumber();
  
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      certificate_number: certificateNumber,
      member_id: memberId,
      course_id: courseId,
      title: title,
      is_verified: true,
    })
    .select()
    .single();

  return { data, error };
};

export const getCertificate = async (certificateNumber: string) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, member:users(*), course:courses(*)')
    .eq('certificate_number', certificateNumber)
    .single();
  return { data, error };
};

export const verifyCertificate = async (certificateNumber: string) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('is_verified')
    .eq('certificate_number', certificateNumber)
    .single();
  
  if (error) return { isValid: false, error };
  return { isValid: data?.is_verified === true, error: null };
};