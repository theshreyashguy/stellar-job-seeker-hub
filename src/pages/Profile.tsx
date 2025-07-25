
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, updateProfile } from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, FileText, Save } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleUpdateProfile = async () => {
    if (!profileData) return;
    setIsSaving(true);
    try {
      const updatedProfile = await updateProfile(profileData);
      setProfileData(updatedProfile);
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-stellar-purple animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Failed to load profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-stellar-purple to-stellar-cyan bg-clip-text text-transparent">
            Your Stellar Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Keep your information up-to-date for seamless applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24 text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-stellar-cyan shadow-lg">
                <AvatarImage src={profileData.profile_picture_url} alt={profileData.username} />
                <AvatarFallback className="bg-stellar-purple text-white">
                  {profileData.username ? (
                    <span className="text-4xl">{profileData.username.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={48} className="text-stellar-cyan" />
                  )}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white">{profileData.username}</h2>
              <p className="text-stellar-cyan">{profileData.profile_title}</p>
              
              <div className="mt-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-2">Navigation</h3>
                <nav className="space-y-2">
                  <a href="#account-info" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-stellar-purple/20 p-2 rounded-lg transition-colors duration-300">
                    <User size={20} />
                    <span>Account Information</span>
                  </a>
                  <a href="#professional-details" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-stellar-purple/20 p-2 rounded-lg transition-colors duration-300">
                    <FileText size={20} />
                    <span>Professional Details</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div id="account-info" className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_title" className="text-gray-300">Profile Title</Label>
                  <Input
                    id="profile_title"
                    name="profile_title"
                    value={profileData.profile_title}
                    onChange={handleChange}
                    placeholder="e.g., Full Stack Developer"
                    className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_picture_url" className="text-gray-300">Profile Picture URL</Label>
                  <Input
                    id="profile_picture_url"
                    name="profile_picture_url"
                    value={profileData.profile_picture_url}
                    onChange={handleChange}
                    placeholder="https://your-image-url.com/profile.png"
                    className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div id="professional-details" className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Professional Details</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resume_url" className="text-gray-300">Resume URL</Label>
                  <Input
                    id="resume_url"
                    name="resume_url"
                    value={profileData.resume_url}
                    onChange={handleChange}
                    placeholder="https://your-resume-link.com"
                    className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url" className="text-gray-300">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      value={profileData.linkedin_url}
                      onChange={handleChange}
                      className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github_url" className="text-gray-300">GitHub URL</Label>
                    <Input
                      id="github_url"
                      name="github_url"
                      value={profileData.github_url}
                      onChange={handleChange}
                      className="bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cold_email_template" className="text-gray-300">
                    Cold Email Template
                  </Label>
                  <Textarea
                    id="cold_email_template"
                    name="cold_email_template"
                    value={profileData.cold_email_template}
                    onChange={handleChange}
                    className="h-40 bg-stellar-navy/50 border-stellar-cyan/20 text-white"
                    placeholder="Write your generic cold email template here..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSaving}
                className="bg-stellar-purple hover:bg-stellar-purple/80 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-300 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
