import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  ShieldAlert, Menu, X, Sun, Moon, Bell, User,
  LogOut, ChevronDown, PlusCircle, CheckCircle2,
  Sparkles, Layers, BarChart2, Compass, HelpCircle,
  Building2, GraduationCap, Briefcase, Landmark
} from 'lucide-react';

const ROLES_LIST = [
  { role: 'CITIZEN', label: 'Citizen', desc: 'Report & track complaints', icon: User },
  { role: 'AUTHORITY_OFFICER', label: 'Authority Officer', desc: 'Manage field assignments', icon: Building2 },
  { role: 'GOVERNMENT_OFFICIAL', label: 'Government Official', desc: 'City-wide command center', icon: Landmark },
  { role: 'SYSTEM_ADMIN', label: 'System Admin', desc: 'Verification & routing', icon: ShieldAlert },
  { role: 'STUDENT_TEAM', label: 'Student Team', desc: 'Innovation proposals & tasks', icon: GraduationCap },
  { role: 'FACULTY_MENTOR', label: 'Faculty Mentor', desc: 'Review student proposals', icon: Layers },
  { role: 'INDUSTRY_PARTNER', label: 'Industry Partner', desc: 'Pilots & mentorship', icon: Briefcase },
  { role: 'UNIVERSITY_TEAM', label: 'University Cell', desc: 'Campus innovation center', icon: GraduationCap },
];

export default function Navbar() {
  const { user, isAuthenticated, role, logout, switchDemoRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const roleRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          // Track if page has scrolled from the top
          setIsScrolled(currentScrollY > 10);

          if (currentScrollY <= 30) {
            // Near top -> always visible
            setIsVisible(true);
          } else if (diff > 8 && currentScrollY > 50) {
            // Scrolled down by at least 8px -> smooth hide
            if (!mobileMenuOpen) {
              setIsVisible(false);
              setRoleDropdownOpen(false);
              setUserDropdownOpen(false);
              setNotifDropdownOpen(false);
            }
          } else if (diff < -8) {
            // Scrolled up by at least 8px -> smooth reveal
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
      setNotifDropdownOpen(false);
      if (link) navigate(link);
    } catch (err) { }
  };

  const handleDemoSwitch = async (targetRole) => {
    try {
      await switchDemoRole(targetRole);
      setRoleDropdownOpen(false);
      // Auto route to appropriate role dashboard
      if (targetRole === 'CITIZEN') navigate('/dashboard');
      else if (targetRole === 'AUTHORITY_OFFICER') navigate('/officer-dashboard');
      else if (targetRole === 'SYSTEM_ADMIN') navigate('/admin-dashboard');
      else if (targetRole === 'GOVERNMENT_OFFICIAL') navigate('/government-dashboard');
      else if (targetRole === 'STUDENT_TEAM') navigate('/student-dashboard');
      else if (targetRole === 'FACULTY_MENTOR') navigate('/faculty-dashboard');
      else if (targetRole === 'INDUSTRY_PARTNER') navigate('/industry-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      alert("Failed to switch demo role: " + err.message);
    }
  };

  const getDashboardPath = () => {
    if (role === 'SYSTEM_ADMIN') return '/admin-dashboard';
    if (role === 'AUTHORITY_OFFICER') return '/officer-dashboard';
    if (role === 'GOVERNMENT_OFFICIAL') return '/government-dashboard';
    if (role === 'STUDENT_TEAM') return '/student-dashboard';
    if (role === 'FACULTY_MENTOR') return '/faculty-dashboard';
    if (role === 'INDUSTRY_PARTNER') return '/industry-dashboard';
    return '/dashboard';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover Issues', path: '/issues' },
    { label: 'Solution Hub', path: '/solutions' },
    { label: 'Impact Analytics', path: '/impact' },
    { label: 'About Us', path: '/about' },
  ];

  const currentRoleObj = ROLES_LIST.find(r => r.role === role) || ROLES_LIST[0];

  return (
    <header className={`sticky top-2 sm:top-2.5 z-50 w-full max-w-[98%] xl:max-w-[1600px] mx-auto px-1 sm:px-2 will-change-transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible
        ? 'translate-y-0 opacity-100'
        : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
      <div className={`w-full bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-2xl text-slate-100 px-4 sm:px-6 lg:px-8 transition-all duration-300 shadow-md shadow-black/20 ${isScrolled ? 'border-slate-600 shadow-lg shadow-black/25' : ''
        }`}>
        <div className="flex items-center justify-between h-14">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center group py-0.5">
            <img
              src="/logo-dark.png"
              alt="CivicSolve AI"
              className="h-8 sm:h-9 max-h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1.5 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`group relative px-2 md:px-2.5 lg:px-3 py-1.5 text-[11px] md:text-xs lg:text-[12.5px] font-medium transition-colors duration-200 whitespace-nowrap ${isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-300 hover:text-white'
                    }`}
                >
                  <span className="relative z-10 block transition-transform duration-200 group-hover:-translate-y-0.5">
                    {link.label}
                  </span>

                  {/* Animated underline with transition (fixed when active) */}
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-brand-400 via-indigo-400 to-civic-cyan transition-all duration-300 ease-out ${isActive
                        ? 'w-4/5 opacity-100 shadow-[0_0_8px_rgba(129,140,248,0.7)]'
                        : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100'
                      }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="hidden lg:flex items-center space-x-2.5">

            {/* Quick Demo Role Switcher for SIH/College Evaluators */}
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] lg:text-xs font-semibold text-indigo-300 hover:bg-slate-700/80 hover:text-white transition-colors shadow-sm whitespace-nowrap"
                title="Switch Demonstration Role Persona"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentRoleObj.label}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-100">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Evaluator Persona Switcher
                    </p>
                    <p className="text-[11px] text-slate-400">One-click test any of the 8 verified roles:</p>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {ROLES_LIST.map((item) => {
                      const Icon = item.icon;
                      const isCurrent = role === item.role;
                      return (
                        <button
                          key={item.role}
                          onClick={() => handleDemoSwitch(item.role)}
                          className={`w-full flex items-start space-x-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${isCurrent
                              ? 'bg-brand-600/30 text-white font-semibold border border-brand-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                          <Icon className="w-4 h-4 mt-0.5 text-slate-400" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.label}</span>
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-slate-100">
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await api.markAllNotificationsRead();
                            loadNotifications();
                          }}
                          className="text-[11px] text-brand-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-800">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id, n.link)}
                            className={`p-2.5 text-xs cursor-pointer hover:bg-slate-800/70 transition-colors ${!n.is_read ? 'bg-indigo-950/40' : ''
                              }`}
                          >
                            <p className="font-semibold text-slate-200">{n.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Report an Issue CTA */}
            <Link
              to={isAuthenticated ? "/report" : "/login?redirect=/report"}
              className="inline-flex items-center space-x-1.5 px-2.5 lg:px-3 py-1 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-[11px] lg:text-xs font-semibold shadow-sm transition-all shadow-brand-500/25 active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium text-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 text-slate-100">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-2.5 py-1 rounded-lg text-[11px] lg:text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-1.5 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 border border-slate-700/80 dark:border-slate-800 bg-slate-900/95 backdrop-blur-md rounded-2xl px-4 pt-3 pb-5 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-colors ${isActive
                      ? 'text-white font-semibold bg-brand-600/25 border-l-2 border-brand-400 pl-4'
                      : 'text-slate-200 hover:bg-slate-800'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <Link
              to={isAuthenticated ? "/report" : "/login?redirect=/report"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report a Problem</span>
            </Link>

            {isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 text-white font-medium text-xs"
                >
                  <BarChart2 className="w-4 h-4 text-brand-400" />
                  <span>Go to My Dashboard ({role})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 font-medium text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs"
              >
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

