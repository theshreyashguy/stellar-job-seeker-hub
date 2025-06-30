
import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Star } from 'lucide-react';

const Profile = () => {
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
              <h2 className="text-2xl font-bold text-white mb-2">Job Seeker</h2>
              <p className="text-stellar-cyan mb-4">Software Developer</p>
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                Active job seeker with 47 applications sent
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-stellar-cyan" />
                  <span className="text-white">jobseeker@example.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={20} className="text-stellar-cyan" />
                  <span className="text-white">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-stellar-cyan" />
                  <span className="text-white">San Francisco, CA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase size={20} className="text-stellar-cyan" />
                  <span className="text-white">5+ years experience</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Job Search Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Preferred Role
                  </label>
                  <select className="w-full p-3 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white focus:border-stellar-purple focus:outline-none">
                    <option>Software Developer</option>
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>Full Stack Developer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Experience Level
                  </label>
                  <select className="w-full p-3 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white focus:border-stellar-purple focus:outline-none">
                    <option>Mid-level (3-5 years)</option>
                    <option>Entry-level (0-2 years)</option>
                    <option>Senior (5+ years)</option>
                    <option>Lead/Principal (8+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Salary Range
                  </label>
                  <select className="w-full p-3 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white focus:border-stellar-purple focus:outline-none">
                    <option>$80k - $120k</option>
                    <option>$60k - $80k</option>
                    <option>$120k - $160k</option>
                    <option>$160k+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Work Type
                  </label>
                  <select className="w-full p-3 bg-stellar-navy/50 border border-gray-600 rounded-lg text-white focus:border-stellar-purple focus:outline-none">
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                    <option>Any</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 
                  'MongoDB', 'PostgreSQL', 'GraphQL', 'REST APIs', 'Git', 'Agile'
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-stellar-purple/20 text-stellar-purple border border-stellar-purple/30 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-8 py-3 rounded-lg transition-colors duration-300">
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
