import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { courses } from "./mockData";
import { FaPlayCircle, FaCheckCircle, FaLock, FaClock } from "react-icons/fa";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isPurchased, setIsPurchased] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    // 1. Try to find in mock data
    const mockCourse = courses.find(c => c.id === courseId);
    if (mockCourse) {
       setCourse(mockCourse);
    } else {
       // Fallback or legacy loading logic could go here
       // For this demo, we'll just default to the first mock course if not found
       setCourse(courses[0]); 
    }

    // 2. Check purchase status
    const purchased = localStorage.getItem(`purchased_${courseId}`);
    if (purchased) {
      setIsPurchased(true);
    }
  }, [courseId]);

  const handlePurchase = () => {
    // Simulate purchase
    localStorage.setItem(`purchased_${courseId}`, 'true');
    setIsPurchased(true);
    // Redirect to player
    navigate(`/learn/course/${courseId}/watch`);
  };

  if (!course) return <div className="p-10 text-center text-gray-900 bg-white h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-50 py-16 px-6 lg:px-24 mt-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-green-600 font-semibold tracking-wide uppercase text-sm">Course</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 leading-tight text-gray-900">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-500">
               <div className="flex items-center gap-2">
                 <FaClock className="text-green-500" />
                 <span>{course.totalDuration}</span>
               </div>
               <div className="flex items-center gap-2">
                 <FaPlayCircle className="text-green-500" />
                 <span>{course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0)} Lessons</span>
               </div>
            </div>

            <button
              onClick={isPurchased ? () => navigate(`/learn/course/${course.id}/watch`) : handlePurchase}
              className={`px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-transparent ${
                isPurchased 
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {isPurchased ? "Continue Learning" : "Enroll Now - Start Learning"}
            </button>
            {!isPurchased && (
               <p className="mt-3 text-xs text-gray-500">30-Day Money-Back Guarantee • Full Lifetime Access</p>
            )}
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-100">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
             
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16 px-6 lg:px-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Course Curriculum</h2>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {course.chapters.map((chapter, index) => (
              <div key={chapter.id} className="border-b last:border-0 border-gray-100">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    Chapter {index + 1}: {chapter.title}
                  </h3>
                  <span className="text-xs text-gray-500">{chapter.videos.length} videos</span>
                </div>
                <div className="bg-white">
                  {chapter.videos.map((video, _vIndex) => (
                    <div key={video.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
                      {isPurchased ? (
                         <div className="text-green-500"><FaPlayCircle /></div>
                      ) : (
                         <div className="text-gray-400"><FaLock /></div>
                      )}
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {video.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{video.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
