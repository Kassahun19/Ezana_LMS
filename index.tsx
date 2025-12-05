import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURATION & CONSTANTS ---
const YOUTUBE_API_KEY = "AIzaSyCJktqWHyapr-JTlOfoyWpXdYkoH5RF6Co";
const DEFAULT_PLAYLIST_ID = "PLsOq5HvvZkSuCGOoW2OsCeyEEpUugjwpY"; // For Web Dev
const GRADE_7_MATH_PLAYLIST_ID = "PLrB0Hrh8R-FqvP-q5ZVPaBhQbH0FgKOX1"; // For Grade 7 Math
const GRADE_8_MATH_PLAYLIST_ID = "PLrB0Hrh8R-Fp9RlZ1-iWhHV19V5RyqAVA"; // For Grade 8 Math
const GRADE_9_MATH_PLAYLIST_ID = "PLrB0Hrh8R-FpIFBhxD_J3jzXkY2Iv97eg";
const GRADE_10_MATH_PLAYLIST_ID = "PLrB0Hrh8R-Fo_FYtcSmCZafv8Trfv0CK8";
const GRADE_11_MATH_PLAYLIST_ID = "PLrB0Hrh8R-FpnzIJ81QQgA67ELvbezsYn";
const GRADE_12_MATH_PLAYLIST_ID = "PLrB0Hrh8R-FprCuLeTTms_uyGJrXFE5hc";

const CEO_IMAGE_URL =
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

// --- MOCK DATABASE (LocalStorage Wrapper) ---
const DB = {
  init: () => {
    try {
      if (!localStorage.getItem("ezana_users")) {
        localStorage.setItem(
          "ezana_users",
          JSON.stringify([
            {
              id: 1,
              name: "Admin User",
              email: "admin@ezana.com",
              password: "password",
              role: "admin",
              enrolledCourses: [],
            },
            {
              id: 2,
              name: "Instructor Kassahun",
              email: "kassahun@ezana.com",
              password: "password",
              role: "instructor",
              enrolledCourses: [],
              bio: "Senior Software Engineer",
            },
            {
              id: 3,
              name: "Student Demo",
              email: "student@ezana.com",
              password: "password",
              role: "student",
              enrolledCourses: ["web"],
            },
          ])
        );
      }
      if (!localStorage.getItem("ezana_posts")) {
        localStorage.setItem(
          "ezana_posts",
          JSON.stringify([
            {
              id: 1,
              title: "The Future of Web Dev in Ethiopia",
              date: "Oct 12, 2024",
              category: "Technology",
              image:
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
            },
            {
              id: 2,
              title: "Mastering Calculus: Tips & Tricks",
              date: "Sep 28, 2024",
              category: "Mathematics",
              image:
                "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
            },
            {
              id: 3,
              title: "How to Improve English Fluency",
              date: "Sep 15, 2024",
              category: "Language",
              image:
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
            },
          ])
        );
      }
      if (!localStorage.getItem("ezana_transactions")) {
        localStorage.setItem(
          "ezana_transactions",
          JSON.stringify([
            {
              id: "TXN-1001",
              user: "Student Demo",
              course: "Full Stack Web Dev",
              amount: 500,
              date: "2024-10-20",
              status: "Completed",
            },
            {
              id: "TXN-1002",
              user: "Abebe Bikila",
              course: "Grade 12 Math",
              amount: 450,
              date: "2024-10-21",
              status: "Completed",
            },
            {
              id: "TXN-1003",
              user: "Sara Tadesse",
              course: "Spoken English",
              amount: 300,
              date: "2024-10-22",
              status: "Pending",
            },
          ])
        );
      }
      if (!localStorage.getItem("ezana_instructor_courses")) {
        localStorage.setItem(
          "ezana_instructor_courses",
          JSON.stringify([
            {
              id: 101,
              title: "Advanced React Patterns",
              students: 120,
              status: "Published",
              category: "Web Development",
            },
            {
              id: 102,
              title: "Intro to Linear Algebra",
              students: 85,
              status: "Pending",
              category: "Mathematics",
            },
          ])
        );
      }
    } catch (e) {
      console.warn("LocalStorage access denied or full");
    }
  },
  getUsers: () => JSON.parse(localStorage.getItem("ezana_users") || "[]"),
  deleteUser: (id) => {
    const users = JSON.parse(localStorage.getItem("ezana_users") || "[]");
    const newUsers = users.filter((u) => u.id !== id);
    localStorage.setItem("ezana_users", JSON.stringify(newUsers));
    return newUsers;
  },
  updateUser: (id, data) => {
    const users = JSON.parse(localStorage.getItem("ezana_users") || "[]");
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      localStorage.setItem("ezana_users", JSON.stringify(users));
      return users[idx];
    }
    return null;
  },
  login: (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem("ezana_users") || "[]");
      return users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase().trim() &&
          u.password === password
      );
    } catch (e) {
      return null;
    }
  },
  register: (
    name,
    email,
    password,
    role = "student",
    phoneNumber = "",
    dateOfBirth = "",
    gender = ""
  ) => {
    try {
      const users = JSON.parse(localStorage.getItem("ezana_users") || "[]");
      if (
        users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
      )
        return null;
      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        phoneNumber,
        dateOfBirth,
        gender,
        enrolledCourses: [],
      };
      users.push(newUser);
      localStorage.setItem("ezana_users", JSON.stringify(users));
      return newUser;
    } catch (e) {
      return null;
    }
  },
  getTransactions: () =>
    JSON.parse(localStorage.getItem("ezana_transactions") || "[]"),
  getInstructorCourses: () =>
    JSON.parse(localStorage.getItem("ezana_instructor_courses") || "[]"),
  getAllCourses: () =>
    JSON.parse(localStorage.getItem("ezana_instructor_courses") || "[]"),
  addInstructorCourse: (course) => {
    const courses = JSON.parse(
      localStorage.getItem("ezana_instructor_courses") || "[]"
    );
    courses.push({ ...course, id: Date.now(), students: 0, status: "Pending" }); // Default pending for approval
    localStorage.setItem("ezana_instructor_courses", JSON.stringify(courses));
    return courses;
  },
  updateCourseStatus: (id, status) => {
    const courses = JSON.parse(
      localStorage.getItem("ezana_instructor_courses") || "[]"
    );
    const idx = courses.findIndex((c) => c.id === id);
    if (idx !== -1) {
      courses[idx].status = status;
      localStorage.setItem("ezana_instructor_courses", JSON.stringify(courses));
    }
    return courses;
  },
};

// --- DATA STRUCTURE FOR COURSES ---
const COURSE_STRUCTURE = {
  web: {
    id: "web",
    title: "Web Development",
    icon: "fa-code",
    color: "bg-blue-100 text-blue-600",
    description: "Master full-stack development from scratch.",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80",
    phases: [
      {
        id: "web_p1",
        title: "Phase I: Static Websites",
        desc: "HTML, CSS & Bootstrap",
        icon: "fa-html5",
        playlistId: DEFAULT_PLAYLIST_ID,
      },
      {
        id: "web_p2",
        title: "Phase II: JavaScript Logic",
        desc: "Learn coding with JavaScript",
        icon: "fa-js",
        playlistId: DEFAULT_PLAYLIST_ID,
      },
      {
        id: "web_p3",
        title: "Phase III: Modern Stack",
        desc: "Node, Express, MySQL, React.js",
        icon: "fa-server",
        playlistId: DEFAULT_PLAYLIST_ID,
      },
      {
        id: "web_p4",
        title: "Phase IV: The Project",
        desc: "Building Full Stack Applications",
        icon: "fa-rocket",
        playlistId: DEFAULT_PLAYLIST_ID,
      },
    ],
  },
  math: {
    id: "math",
    title: "Mathematics",
    icon: "fa-calculator",
    color: "bg-red-100 text-red-600",
    description: "Comprehensive math curriculum for all grades.",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    phases: [
      {
        id: "math_g7",
        title: "Grade 7 Mathematics",
        desc: "Intro to Algebra & Geometry",
        icon: "fa-cube",
        playlistId: GRADE_7_MATH_PLAYLIST_ID,
      },
      {
        id: "math_g8",
        title: "Grade 8 Mathematics",
        desc: "Foundations & Algebra Intro",
        icon: "fa-shapes",
        playlistId: GRADE_8_MATH_PLAYLIST_ID,
      },
      {
        id: "math_g9",
        title: "Grade 9 Mathematics",
        desc: "Geometry & Equations",
        icon: "fa-draw-polygon",
        playlistId: GRADE_9_MATH_PLAYLIST_ID,
      },
      {
        id: "math_g10",
        title: "Grade 10 Mathematics",
        desc: "Functions & Trigonometry",
        icon: "fa-chart-line",
        playlistId: GRADE_10_MATH_PLAYLIST_ID,
      },
      {
        id: "math_g11",
        title: "Grade 11 Mathematics",
        desc: "Vectors & Advanced Algebra",
        icon: "fa-infinity",
        playlistId: GRADE_11_MATH_PLAYLIST_ID,
      },
      {
        id: "math_g12",
        title: "Grade 12 Mathematics",
        desc: "Calculus & Exam Prep",
        icon: "fa-graduation-cap",
        playlistId: GRADE_12_MATH_PLAYLIST_ID,
      },
    ],
  },
  eng: {
    id: "eng",
    title: "English",
    icon: "fa-language",
    color: "bg-green-100 text-green-600",
    description: "Improve your spoken and written English.",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80",
    phases: [
      {
        id: "eng_spoken",
        title: "Spoken English",
        desc: "Fluency, Pronunciation & Conversation",
        icon: "fa-comments",
      },
      {
        id: "eng_grammar",
        title: "Grammar",
        desc: "Rules, Structure & Writing",
        icon: "fa-book",
      },
    ],
  },
};

// --- HELPER COMPONENTS ---

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      if (progress < duration) {
        setCount(Math.min(end, Math.floor((progress / duration) * end)));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return <span ref={ref}>{count}</span>;
};

// --- CORE COMPONENTS ---

const Navbar = ({
  setPage,
  user,
  logout,
  handleSearch,
  theme,
  toggleTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchText);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => setPage("home")}
          >
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-brand-500/30 group-hover:rotate-12 transition-transform duration-300">
              <i className="fa-solid fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
                Ezana Academy
              </h1>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest leading-none">
                Unlock your potential
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <form onSubmit={onSearchSubmit} className="relative group">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none w-48 transition-all group-focus-within:w-64 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:bg-gray-600"
              />
              <i className="fa-solid fa-search absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"></i>
            </form>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <i
                className={`fa-solid ${
                  theme === "light" ? "fa-moon" : "fa-sun"
                } text-gray-600 dark:text-gray-300`}
              ></i>
            </button>

            <button
              onClick={() => setPage("home")}
              className="text-gray-600 hover:text-brand-600 font-medium transition hover:-translate-y-0.5"
            >
              Home
            </button>
            <button
              onClick={() => setPage("about")}
              className="text-gray-600 hover:text-brand-600 font-medium transition hover:-translate-y-0.5"
            >
              About
            </button>
            <button
              onClick={() => window.open("https://kmdev.vercel.app", "_blank")}
              className="text-gray-600 hover:text-brand-600 font-medium transition hover:-translate-y-0.5"
            >
              Portfolio
            </button>
            <button
              onClick={() => setPage("courses")}
              className="text-gray-600 hover:text-brand-600 font-medium transition hover:-translate-y-0.5"
            >
              Courses
            </button>
            <button
              onClick={() => setPage("auth")}
              className="text-gray-600 hover:text-brand-600 font-medium transition hover:-translate-y-0.5"
            >
              Contact
            </button>
            <button
              onClick={() =>
                window.open("http://ye-buna.com/kassahunmulatu", "_blank")
              }
              className="text-gray-600 hover:text-brand-600 font-medium transition hover:-translate-y-0.5 flex items-center gap-1"
            >
              <i className="fa-solid fa-coffee"></i> Buy Me Coffee
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPage("dashboard")}
                  className="px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/70 transition border border-brand-200 dark:border-brand-700 shadow-sm hover:shadow-md"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition hover:rotate-90"
                >
                  <i className="fa-solid fa-right-from-bracket text-lg"></i>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPage("auth")}
                className="px-6 py-2.5 rounded-full bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 text-2xl"
            >
              <i className={`fa-solid ${isOpen ? "fa-times" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-2 shadow-xl animate-fade-in">
          <form onSubmit={onSearchSubmit} className="px-4 py-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </form>
          <button
            onClick={() => {
              setPage("home");
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Home
          </button>
          <button
            onClick={() => {
              setPage("courses");
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Courses
          </button>
          <button
            onClick={() => {
              setPage("about");
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            About
          </button>
          <button
            onClick={() => {
              setPage("contact");
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Contact
          </button>
          <button
            onClick={() => {
              window.open("http://ye-buna.com/kassahunmulatu", "_blank");
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <i className="fa-solid fa-coffee"></i> Buy Me Coffee
          </button>
          {user ? (
            <button
              onClick={() => {
                setPage("dashboard");
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-900/50"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => {
                setPage("auth");
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-900/50"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

const SearchResults = ({ query, setPage }) => {
  const courses = Object.values(COURSE_STRUCTURE);
  const posts = JSON.parse(localStorage.getItem("ezana_posts") || "[]");

  const matchedCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );
  const matchedPhases = courses
    .flatMap((c) => c.phases)
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  const matchedPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-10 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">
          Search Results for "{query}"
        </h2>

        {matchedCourses.length === 0 &&
        matchedPhases.length === 0 &&
        matchedPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fa-solid fa-search text-6xl mb-4 opacity-30"></i>
            <p className="text-xl">No results found.</p>
            <button
              onClick={() => setPage("courses")}
              className="mt-4 text-brand-600 hover:underline"
            >
              Browse all courses
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-slide-up">
            {matchedCourses.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">
                  Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {matchedCourses.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setPage("courses")}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-100 card-3d"
                    >
                      <div
                        className={`${cat.color} w-10 h-10 flex items-center justify-center rounded-lg mb-3`}
                      >
                        <i className={`fa-solid ${cat.icon}`}></i>
                      </div>
                      <h4 className="font-bold text-lg">{cat.title}</h4>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {matchedPhases.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">
                  Specific Courses/Phases
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matchedPhases.map((phase) => (
                    <div
                      key={phase.id}
                      onClick={() => setPage("courses")}
                      className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-100 flex items-center gap-4 card-3d"
                    >
                      <div className="bg-gray-100 w-12 h-12 flex items-center justify-center rounded-full text-gray-500">
                        <i
                          className={`fa-solid ${phase.icon || "fa-book"}`}
                        ></i>
                      </div>
                      <div>
                        <h4 className="font-bold">{phase.title}</h4>
                        <p className="text-xs text-gray-500">{phase.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {matchedPosts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">
                  Blog Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {matchedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition card-3d"
                    >
                      <img
                        src={post.image}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <div className="text-xs text-brand-600 font-bold uppercase mb-1">
                          {post.category}
                        </div>
                        <h4 className="font-bold">{post.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Hero = ({ setPage, toggleAuth }) => (
  <div className="relative pt-20 pb-32 overflow-hidden bg-slate-50 perspective-1000">
    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-50 animate-float"></div>
    <div
      className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-50 animate-float"
      style={{ animationDelay: "1s" }}
    ></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center transform-style-3d">
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-slide-up hover:scale-105 transition-transform cursor-pointer">
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
        <span className="text-sm font-medium text-gray-600">
          Now Enrolling: Full Stack Web Development
        </span>
      </div>

      <h1
        className="text-5xl md:text-7xl font-display font-bold text-gray-900 dark:text-white mb-6 tracking-tight animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        Unlock your <span className="gradient-text">Potential</span>
      </h1>

      <p
        className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        Ethiopia's premier online learning platform. Master Web Development,
        Mathematics, and English with expert-led courses.
      </p>

      <div
        className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up"
        style={{ animationDelay: "0.3s" }}
      >
        <button
          onClick={toggleAuth}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-lg shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition transform duration-300"
        >
          Get Started
        </button>
        <button
          onClick={() => setPage("courses")}
          className="px-8 py-4 rounded-full bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-lg hover:bg-gray-50 hover:scale-105 transition transform flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-play text-brand-600"></i> Explore Courses
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-gray-200 pt-10">
        <div className="hover:transform hover:translate-y-[-5px] transition-transform duration-300">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter end={1500} />+
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Students Enrolled
          </div>
        </div>
        <div className="hover:transform hover:translate-y-[-5px] transition-transform duration-300">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter end={50} />+
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Courses
          </div>
        </div>
        <div className="hover:transform hover:translate-y-[-5px] transition-transform duration-300">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter end={120} />+
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Instructors
          </div>
        </div>
        <div className="hover:transform hover:translate-y-[-5px] transition-transform duration-300">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            4.9/5
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Student Rating
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ... (Other components remain the same until AuthModal) ...

const AuthModal = ({ isOpen, onClose, setUser, setPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setEmail("");
      setPassword("");
      setIsLoading(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (!isLogin && !firstName)) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (isLogin) {
        const user = DB.login(email, password);
        if (user) {
          setUser(user);
          setPage(
            user.role === "admin"
              ? "admin-dashboard"
              : user.role === "instructor"
              ? "instructor-dashboard"
              : "student-dashboard"
          );
        } else {
          setError("Invalid email or password.");
        }
      } else {
        const fullName = `${firstName} ${middleName} ${lastName}`.trim();
        const user = DB.register(
          fullName,
          email,
          password,
          role,
          phoneNumber,
          dateOfBirth
        );
        if (user) {
          setUser(user);
          setPage(
            user.role === "admin"
              ? "admin-dashboard"
              : user.role === "instructor"
              ? "instructor-dashboard"
              : "student-dashboard"
          );
          onClose();
        } else {
          setError("User with this email already exists.");
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleDemoLogin = (email, password) => {
    setIsLoading(true);
    setTimeout(() => {
      const user = DB.login(email, password);
      if (user) {
        setUser(user);
        setPage("dashboard");
        onClose();
      } else {
        // Fallback registration if deleted from localStorage
        const newUser = DB.register(
          email.split("@")[0],
          email,
          password,
          email.includes("admin")
            ? "admin"
            : email.includes("kassahun")
            ? "instructor"
            : "student"
        );
        setUser(newUser);
        setPage("dashboard");
        onClose();
      }
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-black/70 via-brand-900/80 to-slate-900/80 backdrop-blur-md animate-fade-in px-4"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-gradient-to-br from-white via-slate-50 to-brand-50 rounded-3xl shadow-2xl p-8 transform-style-3d card-3d relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent-200/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-all hover:rotate-90 z-10"
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <i
              className={`fa-solid ${
                isLogin ? "fa-right-to-bracket" : "fa-user-plus"
              } text-white text-2xl`}
            ></i>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-brand-700 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Join Ezana"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Your journey to excellence starts here
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3 animate-shake">
            <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="First name"
                    />
                    <i className="fa-solid fa-user absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Middle name (optional)"
                    />
                    <i className="fa-solid fa-user absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Last name"
                    />
                    <i className="fa-solid fa-user absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                  </div>
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +251 915 508 167"
                  />
                  <i className="fa-solid fa-phone absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  <i className="fa-solid fa-calendar absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <i className="fa-solid fa-venus-mars absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I want to be a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 ${
                      role === "student"
                        ? "bg-gradient-to-br from-brand-50 to-brand-100 border-brand-500 text-brand-700 shadow-lg shadow-brand-500/20"
                        : "border-gray-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === "student"}
                      onChange={() => setRole("student")}
                      className="hidden"
                    />
                    <i className="fa-solid fa-graduation-cap text-2xl"></i>
                    <span className="font-semibold">Student</span>
                  </label>
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 ${
                      role === "instructor"
                        ? "bg-gradient-to-br from-accent-50 to-accent-100 border-accent-500 text-accent-700 shadow-lg shadow-accent-500/20"
                        : "border-gray-200 bg-white hover:border-accent-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="instructor"
                      checked={role === "instructor"}
                      onChange={() => setRole("instructor")}
                      className="hidden"
                    />
                    <i className="fa-solid fa-chalkboard-user text-2xl"></i>
                    <span className="font-semibold">Instructor</span>
                  </label>
                </div>
              </div>
            </>
          )}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full px-4 py-3 pl-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
              <i className="fa-solid fa-envelope absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
            </div>
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pl-12 pr-12 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 group-hover:border-brand-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <i className="fa-solid fa-lock absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors"></i>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
            </div>
            {isLogin && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline transition-colors"
                  onClick={() =>
                    alert(
                      "Forgot password? Contact support at kmulatu21@gmail.com"
                    )
                  }
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-xl hover:from-brand-700 hover:to-accent-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-500/30 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Processing...</span>
              </>
            ) : isLogin ? (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Sign In</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-rocket"></i>
                <span>Start Learning</span>
              </>
            )}
          </button>
        </form>

        {/* Social Login Section */}
        {!isLogin && (
          <div className="mt-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-r from-white to-slate-50 text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                <i className="fa-brands fa-google text-blue-600"></i>
                <span className="font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                <i className="fa-brands fa-facebook text-blue-600"></i>
                <span className="font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 relative z-10">
          <p className="text-xs text-center text-gray-500 mb-4 uppercase tracking-wide font-bold">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@ezana.com", "password")}
              className="px-3 py-3 text-xs bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-2 border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <i className="fa-solid fa-crown mr-1"></i>
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("kassahun@ezana.com", "password")}
              className="px-3 py-3 text-xs bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <i className="fa-solid fa-chalkboard-user mr-1"></i>
              Instructor
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("student@ezana.com", "password")}
              className="px-3 py-3 text-xs bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-2 border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <i className="fa-solid fa-graduation-cap mr-1"></i>
              Student
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 relative z-10">
          {isLogin ? "New to Ezana Academy? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-colors"
          >
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CategorySection = ({ setPage }) => (
  <div className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Browse Categories
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Find the right course for your career path
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.values(COURSE_STRUCTURE).map((cat) => (
          <div
            key={cat.id}
            onClick={() => setPage("courses")}
            className="card-3d group cursor-pointer relative overflow-hidden rounded-2xl shadow-lg h-64"
          >
            <img
              src={cat.image}
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div
                className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center mb-3`}
              >
                <i className={`fa-solid ${cat.icon} text-xl`}></i>
              </div>
              <h3 className="text-white text-xl font-bold">{cat.title}</h3>
              <p className="text-gray-300 text-sm mt-1">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FeaturedCourses = ({ setPage }) => (
  <div className="py-20 bg-slate-50 perspective-1000">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Featured Courses
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Hand-picked by our experts
          </p>
        </div>
        <button
          onClick={() => setPage("courses")}
          className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
        >
          View All &rarr;
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Full Stack Web Development",
            category: "Web Development",
            image:
              "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80",
            students: 450,
            rating: 4.9,
          },
          {
            title: "Grade 12 Math Exam Prep",
            category: "Mathematics",
            image:
              "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
            students: 890,
            rating: 4.8,
          },
          {
            title: "Business English Communication",
            category: "English",
            image:
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
            students: 230,
            rating: 4.7,
          },
        ].map((course, i) => (
          <div
            key={i}
            className="card-3d bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-6">
              <div className="text-xs font-bold text-brand-600 uppercase mb-2">
                {course.category}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                {course.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                <span>
                  <i className="fa-solid fa-user-group mr-1"></i>{" "}
                  {course.students}
                </span>
                <span>
                  <i className="fa-solid fa-star text-yellow-400 mr-1"></i>{" "}
                  {course.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WhyChooseUs = () => (
  <div className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Why Choose Ezana Academy?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          We provide the best environment for your growth
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          {
            icon: "fa-chalkboard-teacher",
            title: "Expert Instructors",
            desc: "Learn from industry professionals and experienced teachers.",
          },
          {
            icon: "fa-infinity",
            title: "Lifetime Access",
            desc: "Study at your own pace with unlimited access to materials.",
          },
          {
            icon: "fa-certificate",
            title: "Recognized Certs",
            desc: "Earn certificates to boost your resume and LinkedIn profile.",
          },
          {
            icon: "fa-users",
            title: "Community Support",
            desc: "Join a network of students and mentors for help.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="text-center p-6 rounded-xl hover:bg-slate-50 transition duration-300 card-3d bg-white"
          >
            <div className="w-16 h-16 mx-auto bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-inner">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <div className="py-20 bg-gradient-to-br from-brand-900 to-slate-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold">What Our Students Say</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: "Abebe Kebede",
            role: "Web Developer",
            text: "The web development course changed my career. The project phase was incredibly practical.",
          },
          {
            name: "Sara Tadesse",
            role: "Student",
            text: "Mathematics was always hard for me, but Ezana's grade 11 content made it so easy to understand.",
          },
          {
            name: "Dawit Alemu",
            role: "Freelancer",
            text: "I improved my spoken English significantly. Now I can communicate with international clients confidently.",
          },
        ].map((t, i) => (
          <div
            key={i}
            className="card-3d bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10"
          >
            <div className="flex text-yellow-400 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <i key={s} className="fa-solid fa-star text-sm"></i>
              ))}
            </div>
            <p className="mb-6 italic text-gray-300">"{t.text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold shadow-lg">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BlogSection = () => {
  const posts = JSON.parse(localStorage.getItem("ezana_posts") || "[]");
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
          <p className="text-gray-500 mt-2">
            News and articles from the academy
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="card-3d group cursor-pointer">
              <div className="rounded-xl overflow-hidden mb-4 h-56 shadow-md">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="text-brand-600 text-sm font-bold uppercase mb-2">
                {post.category}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition">
                {post.title}
              </h3>
              <div className="text-gray-500 text-sm">{post.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CTASection = ({ setPage }) => (
  <div className="py-24 bg-slate-50 relative overflow-hidden perspective-1000">
    <div className="max-w-4xl mx-auto px-4 text-center relative z-10 transform-style-3d">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Ready to start your learning journey?
      </h2>
      <p className="text-xl text-gray-600 mb-10">
        Join thousands of students and instructors on Ezana Academy today.
      </p>
      <button
        onClick={() => setPage("auth")}
        className="px-10 py-4 bg-brand-600 text-white font-bold rounded-full shadow-xl hover:bg-brand-700 hover:-translate-y-1 hover:scale-105 transition text-lg animate-pulse"
      >
        Join for Free
      </button>
    </div>
    <div className="absolute top-0 left-0 w-64 h-64 bg-brand-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
    <div
      className="absolute bottom-0 right-0 w-64 h-64 bg-accent-200 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float"
      style={{ animationDelay: "1.5s" }}
    ></div>
  </div>
);

const AdminDashboard = ({ user, setUser }) => {
  const [users, setUsers] = useState(DB.getUsers());
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions] = useState(DB.getTransactions());
  const [courses, setCourses] = useState(DB.getAllCourses());
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleDeleteUser = (id) => {
    if (confirm("Are you sure?")) {
      setUsers(DB.deleteUser(id));
    }
  };

  const handleApproveCourse = (id) => {
    setCourses(DB.updateCourseStatus(id, "Published"));
  };

  const handleRejectCourse = (id) => {
    setCourses(DB.updateCourseStatus(id, "Rejected"));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updated = DB.updateUser(user.id, profileData);
    if (updated) {
      setUser(updated);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-3d">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-500 font-bold uppercase text-xs">
              Total Users
            </div>
            <i className="fa-solid fa-users text-brand-600 bg-brand-50 p-2 rounded-lg"></i>
          </div>
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          <div className="text-green-500 text-xs font-bold mt-1">
            <i className="fa-solid fa-arrow-up"></i> 12% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-3d">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-500 font-bold uppercase text-xs">
              Revenue
            </div>
            <i className="fa-solid fa-dollar-sign text-green-600 bg-green-50 p-2 rounded-lg"></i>
          </div>
          <div className="text-3xl font-bold text-gray-900">ETB 145k</div>
          <div className="text-green-500 text-xs font-bold mt-1">
            <i className="fa-solid fa-arrow-up"></i> 8% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-3d">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-500 font-bold uppercase text-xs">
              Courses
            </div>
            <i className="fa-solid fa-video text-purple-600 bg-purple-50 p-2 rounded-lg"></i>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {courses.length}
          </div>
          <div className="text-gray-400 text-xs mt-1">All systems active</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {["overview", "users", "transactions", "moderation", "settings"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold text-sm transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="p-6">
          {activeTab === "users" && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="py-3">Name</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Role</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-medium text-gray-900">
                        {u.name}
                      </td>
                      <td className="py-3 text-gray-600">{u.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "transactions" && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="py-3">ID</th>
                    <th className="py-3">User</th>
                    <th className="py-3">Course</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-mono text-gray-500">{t.id}</td>
                      <td className="py-3 font-medium text-gray-900">
                        {t.user}
                      </td>
                      <td className="py-3 text-gray-600">{t.course}</td>
                      <td className="py-3 font-bold text-gray-900">
                        ETB {t.amount}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            t.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "moderation" && (
            <div className="overflow-x-auto animate-fade-in">
              <h3 className="text-lg font-bold mb-4">
                Course Content Moderation
              </h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="py-3">Course Title</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {courses.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-medium text-gray-900">
                        {c.title}
                      </td>
                      <td className="py-3 text-gray-600">
                        {c.category || "General"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            c.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : c.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {c.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApproveCourse(c.id)}
                              className="text-green-600 hover:bg-green-50 px-3 py-1 border border-green-200 rounded text-xs font-bold transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCourse(c.id)}
                              className="text-red-600 hover:bg-red-50 px-3 py-1 border border-red-200 rounded text-xs font-bold transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="max-w-md animate-fade-in">
              <h3 className="text-lg font-bold mb-4">Update Profile</h3>
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
                  <i className="fa-solid fa-check-circle mr-2"></i> Saved
                  successfully!
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    value={profileData.password}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
          {activeTab === "overview" && (
            <div className="text-center py-10 text-gray-500 animate-fade-in">
              <i className="fa-solid fa-chart-line text-4xl mb-4 text-brand-200"></i>
              <p>Select a tab to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InstructorDashboard = ({ user, setUser }) => {
  const [courses, setCourses] = useState(DB.getInstructorCourses());
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "Web Development",
  });
  const [activeTab, setActiveTab] = useState("courses");
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleCreateCourse = (e) => {
    e.preventDefault();
    const updatedCourses = DB.addInstructorCourse(newCourse);
    setCourses(updatedCourses);
    setIsCreating(false);
    setNewCourse({ title: "", category: "Web Development" });
    alert("Course created successfully! It is now pending approval.");
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updated = DB.updateUser(user.id, profileData);
    if (updated) {
      setUser(updated);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Instructor Dashboard
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700 shadow-md hover:scale-105 transition transform"
        >
          <i
            className={`fa-solid ${isCreating ? "fa-times" : "fa-plus"} mr-2`}
          ></i>{" "}
          {isCreating ? "Cancel" : "Create New Course"}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 mb-6 animate-slide-up">
          <h3 className="font-bold text-lg mb-4">Create New Course</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Course Title
              </label>
              <input
                required
                type="text"
                value={newCourse.title}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. Advanced JavaScript Patterns"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newCourse.category}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, category: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option>Web Development</option>
                <option>Mathematics</option>
                <option>English</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md"
            >
              Submit for Review
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {["courses", "questions", "earnings", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-bold text-sm transition-colors capitalize ${
                activeTab === tab
                  ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "courses" && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-900 mb-4">My Courses</h3>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-500">No courses yet.</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-gray-100 transition"
                    >
                      <div className="w-16 h-10 bg-brand-100 text-brand-600 flex items-center justify-center rounded overflow-hidden font-bold">
                        <i className="fa-solid fa-book"></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.students} students • {course.category}
                        </div>
                      </div>
                      <div
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          course.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {course.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === "questions" && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-900 mb-4">
                Student Questions
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-brand-50 rounded-lg border border-brand-100 hover:shadow-md transition">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-brand-800">Kidist A.</span>
                    <span className="text-brand-600">2m ago</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">
                    "I don't understand the useEffect hook in React. Can you
                    explain?"
                  </p>
                  <input
                    type="text"
                    placeholder="Type reply..."
                    className="w-full text-xs px-2 py-1 border rounded bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "earnings" && (
            <div className="animate-fade-in text-center py-10">
              <div className="inline-block p-6 rounded-full bg-green-50 text-green-600 text-5xl mb-4">
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Total Earnings: ETB 45,200
              </h3>
              <p className="text-gray-500">
                Your payments are processed monthly.
              </p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="max-w-md animate-fade-in">
              <h3 className="text-lg font-bold mb-4">Instructor Profile</h3>
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
                  <i className="fa-solid fa-check-circle mr-2"></i> Saved
                  successfully!
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    value={profileData.password}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ user, setUser, setPage }) => {
  const [showCert, setShowCert] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
  });
  const [wishlist, setWishlist] = useState([
    "Grade 12 Math Exam Prep",
    "Business English",
  ]);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updated = DB.updateUser(user.id, profileData);
    if (updated) {
      setUser(updated);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {showCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCert(false)}
        >
          <div
            className="bg-white p-8 rounded-xl max-w-2xl w-full mx-4 shadow-2xl relative border-4 border-brand-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-brand-600 -mt-2 -ml-2"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-brand-600 -mb-2 -mr-2"></div>

            <i className="fa-solid fa-certificate text-6xl text-brand-500 mb-2"></i>
            <p className="text-xl text-brand-600 font-bold mb-4">
              Ezana Academy
            </p>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Certificate of Completion
            </h2>
            <p className="text-gray-500 mb-8">This certifies that</p>
            <h3 className="text-2xl font-bold text-brand-700 mb-8 border-b border-gray-200 pb-4 inline-block px-10">
              {user.name}
            </h3>
            <p className="text-gray-600">
              Has successfully completed the course
            </p>
            <h4 className="text-xl font-bold text-gray-900 mt-2 mb-8">
              Full Stack Web Development
            </h4>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-8">
              <span>Date: Oct 24, 2024</span>
              <span>ID: EZ-883920</span>
            </div>
            <div className="mt-8 text-center">
              <div className="border-t border-gray-300 w-48 mx-auto mb-4"></div>
              <p className="text-sm font-bold text-gray-700">
                Kassahun Mulatu Kebede
              </p>
              <p className="text-xs text-gray-500">CEO, Ezana Academy</p>
            </div>
            <button
              onClick={() => setShowCert(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}

      {showQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowQuiz(false)}
        >
          <div
            className="bg-white p-8 rounded-xl max-w-lg w-full mx-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Quiz: JavaScript Basics</h3>
            <div className="space-y-4 mb-6">
              <p className="font-medium text-gray-800">
                1. What is the correct way to declare a variable in ES6?
              </p>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded border border-gray-200 hover:bg-brand-50 hover:border-brand-200 transition">
                  A. variable x = 10;
                </button>
                <button className="w-full text-left p-3 rounded border border-gray-200 hover:bg-brand-50 hover:border-brand-200 transition">
                  B. let x = 10;
                </button>
                <button className="w-full text-left p-3 rounded border border-gray-200 hover:bg-brand-50 hover:border-brand-200 transition">
                  C. v x = 10;
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuiz(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Correct! +10 Points");
                  setShowQuiz(false);
                }}
                className="px-4 py-2 bg-brand-600 text-white font-bold rounded shadow hover:bg-brand-700"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {["courses", "achievements", "wishlist", "billing", "settings"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold text-sm transition-colors capitalize ${
                  activeTab === tab
                    ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
        <div className="p-6">
          {activeTab === "courses" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-3d bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl p-6 text-white shadow-lg">
                  <div className="text-brand-100 text-sm font-bold uppercase mb-1">
                    Courses in Progress
                  </div>
                  <div className="text-4xl font-bold">2</div>
                  <div className="mt-4 w-full bg-brand-800 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-brand-100">
                    Overall Progress: 60%
                  </div>
                </div>
                <div
                  className="card-3d bg-white rounded-xl p-6 border border-gray-100 shadow-sm group cursor-pointer"
                  onClick={() => setShowCert(true)}
                >
                  <div className="text-gray-500 text-sm font-bold uppercase mb-1">
                    Certificates Earned
                  </div>
                  <div className="text-4xl font-bold text-gray-900 group-hover:text-brand-600 transition">
                    1
                  </div>
                  <button className="mt-4 text-xs font-bold text-brand-600 border border-brand-200 px-3 py-1 rounded-full group-hover:bg-brand-50">
                    View Certificates
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "achievements" && (
            <div className="animate-fade-in text-center py-10">
              <i className="fa-solid fa-trophy text-yellow-400 text-5xl mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-900">
                1 Certificate Earned
              </h3>
              <button
                onClick={() => setShowCert(true)}
                className="mt-4 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg font-bold border border-brand-200 hover:bg-brand-100"
              >
                View Latest Certificate
              </button>
            </div>
          )}
          {activeTab === "wishlist" && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-900 mb-4">My Wishlist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-lg shadow-sm"
                  >
                    <span className="font-bold text-gray-800">{item}</span>
                    <button
                      onClick={() => setPage("courses")}
                      className="text-brand-600 font-bold text-sm hover:underline"
                    >
                      Enroll Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "billing" && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="py-2">Date</th>
                    <th className="py-2">Course</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Method</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-600">Oct 20, 2024</td>
                    <td className="py-2 font-medium">Full Stack Web Dev</td>
                    <td className="py-2 font-bold">500 ETB</td>
                    <td className="py-2 text-xs uppercase bg-gray-100 rounded px-1">
                      Chapa
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="max-w-md animate-fade-in">
              <h3 className="text-lg font-bold mb-4">Update Profile</h3>
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
                  <i className="fa-solid fa-check-circle mr-2"></i> Saved
                  successfully!
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    value={profileData.password}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-brand-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I am Ezana AI. I can help you find courses or answer questions about your studies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSessionRef = useRef(null);

  useEffect(() => {
    try {
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction:
              "You are a helpful, encouraging teaching assistant for Ezana Academy, an Ethiopian online learning platform. You help students with Web Development, Mathematics, and English questions. Keep answers concise and educational.",
          },
        });
      }
    } catch (e) {
      console.error("Failed to init AI", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        // Fallback if no API key or init failed
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              text: "I'm sorry, I'm not fully connected right now. Please check the API configuration.",
            },
          ]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      const result = await chatSessionRef.current.sendMessageStream({
        message: userText,
      });

      let fullText = "";
      setMessages((prev) => [...prev, { role: "model", text: "" }]); // Placeholder

      for await (const chunk of result) {
        fullText += chunk.text;
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = fullText;
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-brand-600 animate-bounce"
        }`}
      >
        <i
          className={`fa-solid ${
            isOpen ? "fa-times" : "fa-robot"
          } text-white text-2xl`}
        ></i>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden h-[500px] animate-slide-up origin-bottom-left">
          <div className="bg-brand-600 p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h3 className="font-bold">Ezana Assistant</h3>
              <div className="text-xs opacity-80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>{" "}
                Online
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-none shadow-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:border-brand-500 bg-gray-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition disabled:opacity-50 shadow-md"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

const Courses = ({ setPage, setSelectedCourse }) => {
  const courses = Object.values(COURSE_STRUCTURE);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setPage("course-detail");
  };

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover a wide range of courses designed to help you master new
            skills and achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-3d group flex flex-col h-full border border-gray-100"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-600 shadow-sm">
                  <i className={`fa-solid ${course.icon} mr-1`}></i>{" "}
                  {course.phases.length} Phases
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
                  {course.description}
                </p>

                <div className="space-y-3 mb-6">
                  {course.phases.slice(0, 2).map((phase, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"
                    >
                      <i
                        className={`fa-solid ${phase.icon} text-brand-400`}
                      ></i>
                      <span className="truncate">{phase.title}</span>
                    </div>
                  ))}
                  {course.phases.length > 2 && (
                    <div className="text-xs text-center text-gray-400 italic">
                      + {course.phases.length - 2} more phases
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCourseClick(course)}
                  className="w-full py-3 rounded-xl border-2 border-brand-100 text-brand-600 font-bold hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors"
                >
                  View Curriculum
                </button>
                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    ETB 1,000
                  </div>
                  <button
                    onClick={() =>
                      window.open("http://ye-buna.com/kassahunmulatu", "_blank")
                    }
                    className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
                  >
                    Start now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseDetail = ({
  course,
  setPage,
  user,
  setSelectedCourse,
  setShowEnrollmentModal,
}) => {
  const [activeTab, setActiveTab] = useState("curriculum");
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [phaseVideos, setPhaseVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const togglePhase = async (phase) => {
    if (expandedPhase === phase.id) {
      setExpandedPhase(null);
      return;
    }

    setExpandedPhase(phase.id);

    if (!phaseVideos[phase.id] && phase.playlistId) {
      setLoadingVideos(true);
      try {
        let fetchedVideos = [];
        let nextPageToken = "";
        let pageCount = 0;

        // Fetch loop to get all videos (limit 150 for safety)
        do {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${phase.playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`
          );
          const data = await response.json();

          if (data.items) {
            fetchedVideos = [...fetchedVideos, ...data.items];
          }

          nextPageToken = data.nextPageToken;
          pageCount++;
        } while (nextPageToken && pageCount < 3);

        setPhaseVideos((prev) => ({ ...prev, [phase.id]: fetchedVideos }));
      } catch (error) {
        console.error("Failed to fetch videos", error);
      }
      setLoadingVideos(false);
    }
  };

  return (
    <div className="bg-white min-h-screen animate-fade-in pb-20">
      {/* Header */}
      <div className="relative h-96 bg-slate-900 text-white overflow-hidden">
        <img
          src={course.image}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <button
            onClick={() => setPage("courses")}
            className="absolute top-8 left-4 text-white/80 hover:text-white flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Courses
          </button>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${course.color
              .replace("text-", "bg-")
              .replace(
                "bg-",
                "text-"
              )} bg-opacity-20 backdrop-blur-md border border-white/20 w-fit mb-4`}
          >
            <i className={`fa-solid ${course.icon}`}></i>
            <span className="font-bold text-sm">{course.title}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
            {course.title} Masterclass
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            {course.description} Join thousands of students learning today.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (!user) {
                  alert("Please log in to enroll in this course.");
                  setPage("auth");
                  return;
                }
                setSelectedCourse(course);
                setShowEnrollmentModal(true);
              }}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-full shadow-lg shadow-brand-600/30 transition transform hover:-translate-y-1"
            >
              {user ? "Enroll Now" : "Login to Enroll"}
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/20 transition">
              Watch Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
              {["curriculum", "instructor", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-wide transition border-b-2 ${
                    activeTab === tab
                      ? "text-brand-600 border-brand-600"
                      : "text-gray-500 border-transparent hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "curriculum" && (
              <div className="space-y-6 animate-fade-in">
                {course.phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
                  >
                    <div
                      className="p-6 flex items-start gap-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => togglePhase(phase)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-xl shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {phase.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {phase.desc}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <i className={`fa-solid ${phase.icon}`}></i>
                          <span>
                            {phase.playlistId
                              ? "Video Lessons Available"
                              : "8 Lessons"}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-brand-600">
                        <i
                          className={`fa-solid ${
                            expandedPhase === phase.id
                              ? "fa-chevron-up"
                              : "fa-chevron-down"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {expandedPhase === phase.id && (
                      <div className="border-t border-gray-100 bg-slate-50 p-6 animate-fade-in">
                        {loadingVideos ? (
                          <div className="flex justify-center py-4 text-gray-500">
                            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>{" "}
                            Loading lessons...
                          </div>
                        ) : phaseVideos[phase.id] ? (
                          <div className="grid grid-cols-1 gap-4">
                            {phaseVideos[phase.id].map((video) => (
                              <div
                                key={video.id}
                                className="flex gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition cursor-pointer"
                                onClick={() => {
                                  if (
                                    user &&
                                    user.enrolledCourses.includes(course.id)
                                  ) {
                                    setSelectedVideo(video);
                                    setShowVideoModal(true);
                                  } else {
                                    alert(
                                      "Please enroll in this course to watch videos."
                                    );
                                  }
                                }}
                              >
                                <img
                                  src={video.snippet.thumbnails.default.url}
                                  alt={video.snippet.title}
                                  className="w-32 h-20 object-cover rounded-md"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2">
                                    {video.snippet.title}
                                  </h4>
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {video.snippet.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 italic">
                            No video content available for this section yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "instructor" && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 animate-fade-in">
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src={CEO_IMAGE_URL}
                    className="w-20 h-20 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <h3 className="text-xl font-bold">Kassahun Mulatu</h3>
                    <p className="text-brand-600 font-medium">
                      Senior Software Engineer & Educator
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Kassahun is a passionate educator with over 5 years of
                  experience in software development and teaching. He
                  specializes in full-stack web development and has helped
                  hundreds of students launch their careers.
                </p>
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-900">4.9</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-900">1.5k+</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-900">5</div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6 animate-fade-in">
                {[1, 2, 3].map((r) => (
                  <div
                    key={r}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700">
                          S
                        </div>
                        <div>
                          <div className="font-bold text-sm">Student Name</div>
                          <div className="text-xs text-gray-500">
                            2 days ago
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-xs">
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      "This course was exactly what I needed. The explanations
                      are clear and the projects are very practical. Highly
                      recommended!"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ETB 1,000{" "}
                <span className="text-lg text-gray-400 line-through font-normal">
                  ETB 4,000
                </span>
              </div>
              <div className="text-red-500 text-sm font-bold mb-6">
                <i className="fa-solid fa-clock"></i> 38% OFF for next 24h
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    alert("Please log in to enroll in this course.");
                    setPage("auth");
                    return;
                  }
                  setSelectedCourse(course);
                  setShowEnrollmentModal(true);
                }}
                className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition mb-4"
              >
                Enroll Now
              </button>
              <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition mb-8">
                Add to Wishlist
              </button>

              <h4 className="font-bold text-gray-900 mb-4">
                This course includes:
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <i className="fa-solid fa-video w-5 text-center text-gray-400"></i>{" "}
                  45 hours on-demand video
                </li>
                <li className="flex items-center gap-3">
                  <i className="fa-solid fa-file w-5 text-center text-gray-400"></i>{" "}
                  12 articles
                </li>
                <li className="flex items-center gap-3">
                  <i className="fa-solid fa-download w-5 text-center text-gray-400"></i>{" "}
                  25 downloadable resources
                </li>
                <li className="flex items-center gap-3">
                  <i className="fa-solid fa-infinity w-5 text-center text-gray-400"></i>{" "}
                  Full lifetime access
                </li>
                <li className="flex items-center gap-3">
                  <i className="fa-solid fa-mobile w-5 text-center text-gray-400"></i>{" "}
                  Access on mobile and TV
                </li>
                <li className="flex items-center gap-3">
                  <i className="fa-solid fa-certificate w-5 text-center text-gray-400"></i>{" "}
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const About = () => (
  <div className="min-h-screen bg-white pt-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 animate-slide-up">
        <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
          About Ezana Academy
        </h2>
        <div className="w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
        <div className="relative group perspective-1000">
          <div className="absolute inset-0 bg-brand-200 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6"></div>
          <img
            src={CEO_IMAGE_URL}
            alt="Kassahun Mulatu - CEO of Ezana Academy"
            className="relative rounded-2xl shadow-xl w-full object-cover h-[500px] transition-transform group-hover:scale-[1.01] card-3d"
          />
        </div>
        <div className="animate-fade-in">
          <div className="inline-block px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-sm font-bold mb-4">
            CEO & Founder
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Meet Kassahun Mulatu
          </h3>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Based in{" "}
            <span className="font-bold text-gray-800">Bahir Dar, Ethiopia</span>
            , Kassahun Mulatu is a visionary educator and tech leader. As the
            founder of Ezana Academy, his mission is to democratize education in
            Ethiopia and beyond.
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We believe that high-quality education in Web Development, English,
            and Mathematics should be accessible to everyone. Ezana Academy
            combines modern technology with traditional teaching values to
            unlock your true potential.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 card-3d bg-slate-50 p-3 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                  Call Me
                </div>
                <div className="font-bold text-gray-900 text-lg">
                  0915508167
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 card-3d bg-slate-50 p-3 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                  Email Me
                </div>
                <div className="font-bold text-gray-900 text-lg">
                  kmulatu21@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-24 animate-slide-up">
        <h3 className="text-3xl font-bold text-center mb-12">Our Journey</h3>
        <div className="relative border-l-4 border-brand-100 ml-6 md:ml-12 space-y-12">
          {[
            {
              year: "2022",
              title: "The Idea",
              desc: "Kassahun conceptualized Ezana Academy to bridge the digital skills gap in Ethiopia.",
            },
            {
              year: "2023",
              title: "First Course Launch",
              desc: "We launched our flagship Full Stack Web Development bootcamp with 50 students.",
            },
            {
              year: "2024",
              title: "Expansion",
              desc: "Added Mathematics and English curriculums, reaching over 1,500 students nationwide.",
            },
          ].map((item, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute -left-3.5 top-1 w-6 h-6 bg-brand-600 rounded-full border-4 border-white shadow-md"></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition card-3d">
                <span className="text-brand-600 font-bold text-xl block mb-2">
                  {item.year}
                </span>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-20">
        {[
          {
            title: "Mission",
            text: "To provide world-class education accessible to every Ethiopian student.",
            icon: "fa-bullseye",
          },
          {
            title: "Vision",
            text: "To be the leading EdTech platform in East Africa.",
            icon: "fa-eye",
          },
          {
            title: "Values",
            text: "Integrity, Excellence, Innovation, and Community.",
            icon: "fa-heart",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-8 bg-slate-50 rounded-xl hover:-translate-y-2 transition duration-300 card-3d"
          >
            <div className="w-16 h-16 mx-auto bg-white shadow-md rounded-full flex items-center justify-center mb-6 text-2xl text-brand-600">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {item.title}
            </h4>
            <p className="text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.name.value || !form.email.value || !form.message.value) {
      alert("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        onClose();
      }, 2000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row transform-style-3d card-3d relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white md:text-gray-500 z-10 hover:text-red-500 transition"
        >
          <i className="fa-solid fa-times text-2xl"></i>
        </button>
        <div className="bg-brand-600 p-10 text-white md:w-1/3">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <p className="mb-8 opacity-90">
            Fill out the form and we will get back to you within 24 hours.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-phone"></i>
              <span>0915508167</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-envelope"></i>
              <span>kmulatu21@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-brands fa-telegram"></i>
              <span>@EzanaAcademy</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-location-dot"></i>
              <span>Bahir Dar, Ethiopia</span>
            </div>
          </div>
        </div>

        <div className="p-10 md:w-2/3 bg-white relative">
          {status === "success" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-check text-4xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Message Sent!
              </h3>
              <p className="text-gray-500 mt-2">We'll be in touch shortly.</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 outline-none transition"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 outline-none transition"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const EnrollmentModal = ({ isOpen, onClose, course, user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    receiptName: "",
    paymentReceipt: null,
    paymentMethod: "chapa",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        paymentMethod: "chapa",
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsProcessing(true);

    // Simulate enrollment process
    setTimeout(() => {
      // Update user's enrolled courses
      const updatedUser = {
        ...user,
        enrolledCourses: [...(user.enrolledCourses || []), course.id],
      };
      setUser(updatedUser);

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem("ezana_users") || "[]");
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem("ezana_users", JSON.stringify(users));
      }

      // Add transaction record
      const transactions = JSON.parse(
        localStorage.getItem("ezana_transactions") || "[]"
      );
      const newTransaction = {
        id: `TXN-${Date.now()}`,
        user: user.name,
        course: course.title,
        amount: 1000, // ETB 1,000
        date: new Date().toISOString().split("T")[0],
        status: "Completed",
      };
      transactions.push(newTransaction);
      localStorage.setItem("ezana_transactions", JSON.stringify(transactions));

      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform-style-3d card-3d relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 z-10 hover:text-red-500 transition"
        >
          <i className="fa-solid fa-times text-2xl"></i>
        </button>

        <div className="bg-gradient-to-r from-brand-600 to-accent-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Enroll in {course?.title}</h2>
          <p className="opacity-90">
            Complete your enrollment to start learning
          </p>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-check text-4xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Enrollment Successful!
              </h3>
              <p className="text-gray-600">
                Welcome to {course?.title}. You can now access your course
                materials.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300"
                  placeholder="+251 911 123 456"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name on Receipt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.receiptName}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300"
                  placeholder="Name as it appears on payment receipt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Payment Receipt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentReceipt: e.target.files[0],
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    required
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Accepted formats: JPG, PNG, PDF. Max size: 5MB
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:scale-105 ${
                      formData.paymentMethod === "chapa"
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="chapa"
                      checked={formData.paymentMethod === "chapa"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="hidden"
                    />
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Chapa</div>
                      <div className="text-xs text-gray-500">Mobile Money</div>
                    </div>
                    {formData.paymentMethod === "chapa" && (
                      <i className="fa-solid fa-check text-brand-500 ml-auto"></i>
                    )}
                  </label>
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:scale-105 ${
                      formData.paymentMethod === "telebirr"
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="telebirr"
                      checked={formData.paymentMethod === "telebirr"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="hidden"
                    />
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        TeleBirr
                      </div>
                      <div className="text-xs text-gray-500">
                        Mobile Banking
                      </div>
                    </div>
                    {formData.paymentMethod === "telebirr" && (
                      <i className="fa-solid fa-check text-brand-500 ml-auto"></i>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">Course Fee</span>
                  <span className="font-bold text-gray-900">ETB 1,000</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Processing Fee</span>
                  <span>ETB 0</span>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-brand-600">ETB 1,000</span>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open("http://ye-buna.com/kassahunmulatu", "_blank")
                }
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-500/30 flex items-center justify-center gap-2 mb-4"
              >
                <i className="fa-solid fa-credit-card"></i>
                <span>Buy Now</span>
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-xl hover:from-brand-700 hover:to-accent-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Processing Enrollment...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rocket"></i>
                    <span>Complete Enrollment</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoModal = ({ isOpen, onClose, video }) => {
  if (!isOpen || !video) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform-style-3d card-3d relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 z-10 hover:text-red-500 transition"
        >
          <i className="fa-solid fa-times text-2xl"></i>
        </button>

        <div className="p-6 bg-slate-50 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {video.snippet.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {video.snippet.description}
          </p>
        </div>

        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.contentDetails.videoId}`}
            title={video.snippet.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, setUser, setPage }) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl text-brand-600 font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}
              </h1>
              <span className="inline-block px-2 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded uppercase tracking-wide">
                {user.role} Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === "admin" ? (
          <AdminDashboard user={user} setUser={setUser} />
        ) : user.role === "instructor" ? (
          <InstructorDashboard user={user} setUser={setUser} />
        ) : (
          <StudentDashboard user={user} setUser={setUser} setPage={setPage} />
        )}
      </div>
    </div>
  );
};

const OnboardingPage = ({ user, setPage }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [profileData, setProfileData] = useState({
    bio: "",
    interests: [],
    goals: "",
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = [
    {
      id: "welcome",
      title: "Welcome to Ezana Academy!",
      subtitle: "Your learning journey begins here",
      icon: "fa-rocket",
      color: "from-brand-500 to-accent-500",
    },
    {
      id: "courses",
      title: "Choose Your Learning Path",
      subtitle: "Select courses that interest you",
      icon: "fa-compass",
      color: "from-accent-500 to-purple-500",
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      subtitle: "Tell us more about yourself",
      icon: "fa-user-edit",
      color: "from-purple-500 to-brand-500",
    },
  ];

  const courses = Object.values(COURSE_STRUCTURE);

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleComplete = () => {
    setIsCompleting(true);
    // Save onboarding data to user profile
    const updatedUser = {
      ...user,
      enrolledCourses: selectedCourses,
      profile: profileData,
      onboardingCompleted: true,
    };

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem("ezana_users") || "[]");
    const userIndex = users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem("ezana_users", JSON.stringify(users));
    }

    setTimeout(() => {
      setPage("dashboard");
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-100 to-accent-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-graduation-cap text-6xl text-brand-600"></i>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome, {user.name}!
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Congratulations on joining Ezana Academy! We're excited to help
                you unlock your potential through our comprehensive learning
                platform featuring Web Development, Mathematics, and English
                courses.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: "fa-code",
                  title: "Expert-Led Courses",
                  desc: "Learn from industry professionals",
                },
                {
                  icon: "fa-users",
                  title: "Community Support",
                  desc: "Connect with fellow learners",
                },
                {
                  icon: "fa-certificate",
                  title: "Earn Certificates",
                  desc: "Showcase your achievements",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-3d"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <i className={`fa-solid ${item.icon} text-brand-600`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What would you like to learn?
              </h2>
              <p className="text-gray-600">
                Select the courses that align with your goals. You can always
                enroll in more later.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseToggle(course.id)}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-300 hover:scale-105 card-3d ${
                    selectedCourses.includes(course.id)
                      ? "border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/20"
                      : "border-gray-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg ${course.color} flex items-center justify-center mb-4`}
                  >
                    <i className={`fa-solid ${course.icon} text-xl`}></i>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {course.phases.length} phases available
                    </span>
                    {selectedCourses.includes(course.id) && (
                      <i className="fa-solid fa-check-circle text-brand-500"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {selectedCourses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fa-solid fa-info-circle text-3xl mb-4"></i>
                <p>Select at least one course to continue</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tell us about yourself
              </h2>
              <p className="text-gray-600">
                This helps us personalize your learning experience
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us about your background, interests, or goals..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Learning Interests (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Web Development",
                    "Mathematics",
                    "English",
                    "Career Growth",
                    "Entrepreneurship",
                    "Technology",
                  ].map((interest) => (
                    <label
                      key={interest}
                      className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 ${
                        profileData.interests.includes(interest)
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={profileData.interests.includes(interest)}
                        onChange={(e) => {
                          const newInterests = e.target.checked
                            ? [...profileData.interests, interest]
                            : profileData.interests.filter(
                                (i) => i !== interest
                              );
                          setProfileData({
                            ...profileData,
                            interests: newInterests,
                          });
                        }}
                        className="hidden"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Learning Goals (Optional)
                </label>
                <textarea
                  value={profileData.goals}
                  onChange={(e) =>
                    setProfileData({ ...profileData, goals: e.target.value })
                  }
                  placeholder="What do you hope to achieve through learning?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all duration-300 resize-none"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-accent-600 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Ezana Academy
                </h1>
                <p className="text-sm text-gray-500">Setting up your account</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index <= currentStep
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <i className={`fa-solid ${step.icon} text-sm`}></i>
                  </div>
                  <div className="hidden sm:block">
                    <div
                      className={`text-sm font-semibold ${
                        index <= currentStep ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.subtitle}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 transition-all duration-300 ${
                      index < currentStep
                        ? "bg-gradient-to-r from-brand-500 to-accent-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-8 py-3 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    Completing Setup...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check mr-2"></i>
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && selectedCourses.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ezana_theme") || "light";
  });

  useEffect(() => {
    DB.init();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ezana_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const logout = () => {
    setUser(null);
    setPage("home");
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage("search");
  };
  const toggleAuth = () => setPage("auth");
  const toggleContact = () => setPage("contact");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        setPage={setPage}
        user={user}
        logout={logout}
        handleSearch={handleSearch}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-grow">
        {page === "home" && (
          <>
            <Hero setPage={setPage} toggleAuth={toggleAuth} />
            <CategorySection setPage={setPage} />
            <FeaturedCourses setPage={setPage} />
            <WhyChooseUs />
            <Testimonials />
            <BlogSection />
            <CTASection setPage={setPage} />
          </>
        )}
        {page === "onboarding" && user && (
          <OnboardingPage user={user} setPage={setPage} />
        )}
        {page === "about" && <About />}
        {page === "courses" && (
          <Courses setPage={setPage} setSelectedCourse={setSelectedCourse} />
        )}
        {page === "course-detail" && selectedCourse && (
          <CourseDetail
            course={selectedCourse}
            setPage={setPage}
            user={user}
            setSelectedCourse={setSelectedCourse}
            setShowEnrollmentModal={setShowEnrollmentModal}
          />
        )}
        {page === "dashboard" && user && (
          <Dashboard user={user} setUser={setUser} setPage={setPage} />
        )}
        {page === "search" && (
          <SearchResults query={searchQuery} setPage={setPage} />
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold font-display mb-4">
              Ezana Academy
            </h3>
            <p className="text-sm">
              Unlock your potential with the best Ethiopian online learning
              platform.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li
                className="hover:text-white cursor-pointer transition hover:translate-x-1"
                onClick={() => setPage("home")}
              >
                Home
              </li>
              <li
                className="hover:text-white cursor-pointer transition hover:translate-x-1"
                onClick={() => setPage("courses")}
              >
                Courses
              </li>
              <li
                className="hover:text-white cursor-pointer transition hover:translate-x-1"
                onClick={() => setPage("about")}
              >
                About Us
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1">
                Privacy Policy
              </li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1">
                Terms of Service
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <i className="fa-solid fa-phone mr-2"></i> 0915508167
              </li>
              <li>
                <i className="fa-solid fa-envelope mr-2"></i>{" "}
                kmulatu21@gmail.com
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-gray-800 dark:border-gray-700 text-xs">
          &copy; 2024 Ezana Academy. All rights reserved. Built by Kassahun
          Mulatu.
        </div>
      </footer>

      <AuthModal
        isOpen={page === "auth"}
        onClose={() => setPage("home")}
        setUser={setUser}
        setPage={setPage}
      />
      <ContactModal
        isOpen={page === "contact"}
        onClose={() => setPage("home")}
      />
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        course={selectedCourse}
        user={user}
        setUser={setUser}
      />
      <AIAssistant />
    </div>
  );
};

export default App;

const root = createRoot(document.getElementById("root"));
root.render(<App />);
