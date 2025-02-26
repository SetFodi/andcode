"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Loader, 
  AlertTriangle,
  CheckCircle,
  Github,
  Mail,
  MapPin,
  Link as LinkIcon,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const { user, loading, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', message: '' });
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    avatarUrl: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Show/hide passwords
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notifications settings (example, not implemented in backend here)
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    problemUpdates: true,
    forumReplies: true,
    newFeatures: false
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/signin');
      } else {
        setProfileForm({
          username: user.username || '',
          email: user.email || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          github: user.github || '',
          avatarUrl: user.avatarUrl || ''
        });
        setPageLoading(false);
      }
    }
  }, [user, loading, router]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: '', message: '' });
    
    try {
      await updateUserProfile(profileForm);
      setFormMessage({
        type: 'success',
        message: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setFormMessage({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormMessage({
        type: 'error',
        message: 'New passwords do not match.'
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setFormMessage({
        type: 'error',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormMessage({ type: '', message: '' });
    
    try {
      // Assuming an API endpoint exists for password updates
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update password');
      }
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setFormMessage({
        type: 'success',
        message: 'Password updated successfully!'
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      setFormMessage({
        type: 'error',
        message: error.message || 'Failed to update password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppearanceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: '', message: '' });
    
    try {
      // No backend call needed since theme is client-side
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      setFormMessage({
        type: 'success',
        message: 'Appearance settings saved!'
      });
    } catch (error) {
      setFormMessage({
        type: 'error',
        message: 'Failed to save appearance settings.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading || loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Sidebar Navigation */}
          <div className="md:w-64 border-r border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Account Settings
              </h1>
            </div>
            <nav className="py-4">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setFormMessage({ type: '', message: '' });
                }}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <User className="w-5 h-5" />
                Profile Information
              </button>
              <button
                onClick={() => {
                  setActiveTab('security');
                  setFormMessage({ type: '', message: '' });
                }}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => {
                  setActiveTab('appearance');
                  setFormMessage({ type: '', message: '' });
                }}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 ${
                  activeTab === 'appearance' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {formMessage.message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                formMessage.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
              }`}>
                {formMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                )}
                <p>{formMessage.message}</p>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Tell us about yourself"
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Avatar URL
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {profileForm.avatarUrl ? (
                            <img 
                              src={profileForm.avatarUrl} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                              onError={(e) => e.target.src = '/default-avatar.png'} // Fallback image
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-blue-500 text-white text-xl font-bold">
                              {profileForm.username ? profileForm.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          id="avatarUrl"
                          name="avatarUrl"
                          value={profileForm.avatarUrl}
                          onChange={handleProfileChange}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://example.com/avatar.jpg"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={profileForm.location}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="City, Country"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Website
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={profileForm.website}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://example.com"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        GitHub Username
                      </label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="github"
                          name="github"
                          value={profileForm.github}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="username"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Password & Security
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Password must be at least 6 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                      disabled={isSubmitting || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Appearance
                </h2>
                
                <form onSubmit={handleAppearanceSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Theme Preference
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer transition-colors ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          if (theme !== 'light') toggleTheme();
                        }}
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Sun className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Light Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Bright and clean interface</p>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer transition-colors ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          if (theme !== 'dark') toggleTheme();
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                          <Moon className="w-6 h-6 text-gray-200" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}