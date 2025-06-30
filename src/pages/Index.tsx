
import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, Building, Users } from 'lucide-react';

const Index = () => {
  const platforms = [
    {
      name: 'LinkedIn',
      path: '/linkedin',
      icon: Linkedin,
      color: 'from-blue-500 to-blue-700',
      description: 'Professional networking opportunities'
    },
    {
      name: 'Cuvette',
      path: '/cuvette',
      icon: Building,
      color: 'from-green-500 to-green-700',
      description: 'Startup and tech opportunities'
    },
    {
      name: 'Wellfound',
      path: '/wellfound',
      icon: Users,
      color: 'from-purple-500 to-purple-700',
      description: 'Startup jobs and funding'
    },
    {
      name: 'Gmail',
      path: '/gmail',
      icon: Mail,
      color: 'from-red-500 to-red-700',
      description: 'Email management and follow-ups'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12 animate-float">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-stellar-purple to-stellar-cyan bg-clip-text text-transparent">
            Stellar Job Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your cosmic companion for navigating the job search galaxy. 
            Extract opportunities, track applications, and reach for the stars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {platforms.map((platform) => (
            <Link
              key={platform.name}
              to={platform.path}
              className="group"
            >
              <div className="glass glass-hover rounded-2xl p-8 h-64 flex flex-col items-center justify-center space-y-4 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-stellar-purple/20">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}>
                  <platform.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-stellar-purple transition-colors duration-300">
                  {platform.name}
                </h3>
                <p className="text-gray-400 text-center text-sm leading-relaxed">
                  {platform.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 glass rounded-2xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
          <p className="text-gray-300 leading-relaxed">
            Upload your job search files, track applications across platforms, 
            send personalized cold emails, and analyze your job search performance. 
            Let's launch your career to new heights! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
