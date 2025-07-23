import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Github, Linkedin, FileText, MessageSquare } from 'lucide-react';
import { getProfile, updateProfile } from '@/lib/api';

const Profile = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const updatedProfile = await updateProfile(profileData);
      setProfileData(updatedProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profileData) {
    return <div>Failed to load profile.</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-stellar-purple to-stellar-cyan bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your professional profile and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-stellar-purple to-stellar-cyan flex items-center justify-center">
                <User size={48} className="text-white" />
              </div>
              <input type="text" name="username" value={profileData.username} onChange={handleChange} className="text-2xl font-bold text-white bg-transparent text-center mb-2 w-full" />
              <input type="text" name="profile_title" value={profileData.profile_title} onChange={handleChange} className="text-stellar-cyan bg-transparent text-center mb-4 w-full" />
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-stellar-cyan" />
                  <input type="email" name="email" value={profileData.email} onChange={handleChange} className="text-white bg-transparent w-full" />
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={20} className="text-stellar-cyan" />
                  <input type="tel" name="phone" value={profileData.phone} onChange={handleChange} className="text-white bg-transparent w-full" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Links</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Github size={20} className="text-stellar-cyan" />
                  <input type="url" name="github_url" value={profileData.github_url} onChange={handleChange} className="text-white bg-transparent w-full" />
                </div>
                <div className="flex items-center space-x-3">
                  <Linkedin size={20} className="text-stellar-cyan" />
                  <input type="url" name="linkedin_url" value={profileData.linkedin_url} onChange={handleChange} className="text-white bg-transparent w-full" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Resume</h3>
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-stellar-cyan" />
                <input type="url" name="resume_url" value={profileData.resume_url} onChange={handleChange} className="text-white bg-transparent w-full" />
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Cold Email Template</h3>
              <div className="flex items-center space-x-3">
                <MessageSquare size={20} className="text-stellar-cyan" />
                <textarea name="cold_email_template" value={profileData.cold_email_template} onChange={handleChange} className="text-white bg-transparent w-full h-32" />
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleUpdateProfile} className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-8 py-3 rounded-lg transition-colors duration-300">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;