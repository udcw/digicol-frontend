// app/courses/[slug]/learn/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  PlayIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Lesson {
  id: string;
  title: string;
  video_id: string;
  duration: string;
  order: number;
  is_completed?: boolean;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  youtube_playlist_id: string;
  youtube_video_ids: string[];
  has_videos: boolean;
  program: string;
}

export default function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      console.log('Recherche de la formation:', slug);

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!courseData) {
        console.error('Formation non trouvee');
        router.push('/courses');
        return;
      }
      setCourse(courseData);
      console.log('Formation trouvee:', courseData.title);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseData.id)
        .eq('user_id', session.user.id)
        .single();

      if (!enrollmentData) {
        console.error('Non inscrit');
        router.push(`/courses/${slug}`);
        return;
      }
      setEnrollment(enrollmentData);
      setProgress(enrollmentData.progress || 0);
      console.log('Inscription trouvee, progression:', enrollmentData.progress);

      // Créer les leçons à partir des vidéos YouTube
      let lessonsList: Lesson[] = [];
      
      if (courseData.has_videos && courseData.youtube_video_ids && courseData.youtube_video_ids.length > 0) {
        // Utiliser les vidéos YouTube de la formation
        lessonsList = courseData.youtube_video_ids.map((videoId: string, index: number) => ({
          id: `lesson-${index + 1}`,
          title: `Leçon ${index + 1}`,
          video_id: videoId,
          duration: '10 min',
          order: index,
          is_completed: false,
        }));
      } else {
        // Leçons par défaut (fallback)
        lessonsList = [
          {
            id: 'lesson-1',
            title: 'Introduction',
            video_id: 'dQw4w9WgXcQ',
            duration: '8 min',
            order: 0,
            is_completed: false,
          },
          {
            id: 'lesson-2',
            title: 'Module 1',
            video_id: 'dQw4w9WgXcQ',
            duration: '12 min',
            order: 1,
            is_completed: false,
          },
          {
            id: 'lesson-3',
            title: 'Module 2',
            video_id: 'dQw4w9WgXcQ',
            duration: '15 min',
            order: 2,
            is_completed: false,
          },
          {
            id: 'lesson-4',
            title: 'Module 3',
            video_id: 'dQw4w9WgXcQ',
            duration: '10 min',
            order: 3,
            is_completed: false,
          },
          {
            id: 'lesson-5',
            title: 'Conclusion',
            video_id: 'dQw4w9WgXcQ',
            duration: '20 min',
            order: 4,
            is_completed: false,
          },
        ];
      }

      setLessons(lessonsList);

      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('enrollment_id', enrollmentData.id)
        .eq('is_completed', true);

      if (progressData) {
        const completed = progressData.map((p: any) => p.lesson_id);
        setCompletedLessons(completed);
        setLessons(lessonsList.map((l: Lesson) => ({
          ...l,
          is_completed: completed.includes(l.id),
        })));
        console.log('Leçons completées:', completed.length);
      }

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      if (!enrollment) {
        console.error('Aucune inscription trouvee');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (completedLessons.includes(lessonId)) {
        return;
      }

      await supabase
        .from('lesson_progress')
        .insert({
          enrollment_id: enrollment.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);

      setLessons(lessons.map((l: Lesson) => ({
        ...l,
        is_completed: l.id === lessonId ? true : l.is_completed,
      })));

      const newProgress = Math.round((newCompleted.length / lessons.length) * 100);
      const isCompleted = newProgress >= 100;

      await supabase
        .from('enrollments')
        .update({
          progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', enrollment.id);

      setProgress(newProgress);

      if (isCompleted && course) {
        alert('Felicitations ! Vous avez termine la formation !');
        if (confirm('Voulez-vous generer votre certificat maintenant ?')) {
          router.push(`/certificates/generate/${course.id}`);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const goToLesson = (index: number) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentLessonIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acces non autorise</h2>
          <p className="text-gray-500 mb-6">
            Vous devez etre inscrit a cette formation pour y acceder.
          </p>
          <Link href={`/courses/${slug}`} className="text-blue-600 hover:underline">
            Voir la formation
          </Link>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentLessonIndex] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/courses/${slug}`} className="text-gray-600 hover:text-blue-600 transition">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{course.title}</h1>
                <p className="text-xs text-gray-500">Progression: {progress}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-gray-200 rounded-full h-2 hidden sm:block">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {currentLesson ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentLesson.video_id || 'dQw4w9WgXcQ'}?autoplay=0&rel=0`}
                    title={currentLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Contenu a venir</p>
                    <p className="text-sm opacity-75">Cette formation sera bientot disponible</p>
                  </div>
                </div>
              )}

              {currentLesson && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Lecon {currentLessonIndex + 1}: {currentLesson.title}
                      </h3>
                      <p className="text-sm text-gray-500">{currentLesson.duration}</p>
                    </div>
                    <button
                      onClick={() => markLessonComplete(currentLesson.id)}
                      disabled={currentLesson.is_completed}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        currentLesson.is_completed
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {currentLesson.is_completed ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Termine
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Marquer comme terminee
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => goToLesson(currentLessonIndex - 1)}
                      disabled={currentLessonIndex === 0}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Precedent
                    </button>
                    <span className="text-xs text-gray-400">
                      {currentLessonIndex + 1} / {lessons.length}
                    </span>
                    <button
                      onClick={() => goToLesson(currentLessonIndex + 1)}
                      disabled={currentLessonIndex === lessons.length - 1}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {progress >= 100 && course && (
              <div className="mt-6 bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white text-center">
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold">Felicitations !</h3>
                <p className="text-green-100 mt-1 mb-4">
                  Vous avez termine cette formation. Generez votre certificat maintenant !
                </p>
                <Link
                  href={`/certificates/generate/${course.id}`}
                  className="inline-block bg-white text-green-700 hover:bg-green-50 px-6 py-2 rounded-lg font-medium transition"
                >
                  Generer mon certificat
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24 max-h-[600px] overflow-y-auto">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5 text-blue-600" />
                Lecons ({lessons.length})
              </h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => goToLesson(index)}
                    className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                      currentLessonIndex === index
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      currentLessonIndex === index ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        currentLessonIndex === index ? 'text-blue-700 font-medium' : 'text-slate-700'
                      }`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-400">{lesson.duration}</p>
                    </div>
                    {lesson.is_completed && (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}