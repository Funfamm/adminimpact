
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Film, DollarSign, Activity, LogOut, LayoutDashboard, 
  Database, Settings, Check, X, Download, Plus, Edit2, Trash2,
  Home, FileAudio, FileImage, Search, Image as ImageIcon, Loader2, Video
} from 'lucide-react';
import { LiveBackground } from '../components/LiveBackground';
import { api } from '../services/api';
import { Movie, CastingSubmission, SponsorSubmission } from '../types';
import { useToast } from '../App';

type Tab = 'dashboard' | 'movies' | 'casting' | 'sponsors';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [stats, setStats] = useState<any>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [castingSubs, setCastingSubs] = useState<CastingSubmission[]>([]);
  const [sponsorSubs, setSponsorSubs] = useState<SponsorSubmission[]>([]);
  
  // Processing State
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Editing State
  const [isEditingMovie, setIsEditingMovie] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Partial<Movie>>({});
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/login');
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, moviesData, castingData, sponsorsData] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getMovies(),
        api.admin.getCastingSubmissions(),
        api.admin.getSponsorSubmissions()
      ]);
      setStats(analyticsData);
      setMovies(moviesData);
      setCastingSubs(castingData);
      setSponsorSubs(sponsorsData);
    } catch (e) {
      addToast('Failed to load mainframe data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  // --- Actions ---

  const handleStatusUpdate = async (id: string, type: 'casting' | 'sponsor', status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const result = await api.admin.updateSubmissionStatus(id, type, status);
      const emailMsg = result.emailSent ? 'Auto-email sent.' : 'Email failed to send.';
      addToast(`Submission ${status}. ${emailMsg}`, result.emailSent ? 'success' : 'error');
      loadData(); 
    } catch (e) {
      addToast('Operation failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingPoster(true);
      try {
        const file = e.target.files[0];
        const result = await api.uploads.uploadFile(file, 'movie');
        if (result.success) {
          setCurrentMovie(prev => ({ ...prev, thumbnailUrl: result.url }));
          addToast('Poster uploaded successfully', 'success');
        }
      } catch (err) {
        addToast('Poster upload failed', 'error');
      } finally {
        setIsUploadingPoster(false);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('video/')) {
          addToast('Please upload a valid video file', 'error');
          return;
      }

      // No client-side limit for GCS direct uploads (effectively unlimited/5TB)
      // But we warn for sanity if it's excessively huge for a web browser
      if (file.size > 10 * 1024 * 1024 * 1024) { // 10GB warning
          if(!confirm("This file is over 10GB. Upload may take a while. Continue?")) return;
      }

      setIsUploadingVideo(true);
      try {
        addToast('Starting video upload. Do not close window.', 'success');
        const result = await api.uploads.uploadFile(file, 'movie');
        
        if (result.success) {
          setCurrentMovie(prev => ({ ...prev, videoUrl: result.url }));
          addToast('Video uploaded successfully', 'success');
        }
      } catch (err: any) {
        console.error("Upload Error Details:", err);
        
        // Detect CORS / Network Errors specifically
        if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
            alert("NETWORK ERROR (CORS BLOCK):\n\nThe browser blocked the upload to Google Cloud.\n\nYou must run the 'gsutil cors set' command in your Cloud Shell to fix this.\n\nSee the deployment guide.");
            addToast('Upload blocked by CORS', 'error');
        } else if (err.code === 'STORAGE_LIMIT_EXCEEDED') {
           alert(`CRITICAL SERVER CONFIGURATION REQUIRED:\n\nThe file is too large for the current database settings.\n\nRun this SQL command in Supabase to fix it:\n\nupdate storage.buckets\nset file_size_limit = 3221225472\nwhere id = 'media';`);
           addToast('Upload rejected: Server limit reached', 'error');
        } else if (err.message?.includes('Video upload failed')) {
           addToast(err.message, 'error');
        } else {
           addToast('Video upload failed', 'error');
        }
      } finally {
        setIsUploadingVideo(false);
      }
    }
  };

  const handleSaveMovie = async () => {
    if (!currentMovie.title || !currentMovie.description) {
      addToast('Title and description required', 'error');
      return;
    }
    if (!currentMovie.thumbnailUrl) {
      addToast('Movie poster required', 'error');
      return;
    }

    try {
      await api.admin.saveMovie(currentMovie as Movie);
      addToast('Catalog updated successfully', 'success');
      setIsEditingMovie(false);
      setCurrentMovie({});
      loadData();
    } catch (e: any) {
      if (e.message && e.message.includes('column "video_url" of relation "movies" does not exist')) {
          alert("DATABASE SCHEMA ERROR:\n\nYour database is missing the 'video_url' column.\n\nRun this SQL in Supabase:\n\nalter table movies add column video_url text;");
      }
      addToast('Failed to save movie', 'error');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm('CONFIRM DELETION: This will remove the asset from the global CDN.')) return;
    try {
      await api.admin.deleteMovie(id);
      addToast('Asset purged', 'success');
      loadData();
    } catch (e) {
      addToast('Purge failed', 'error');
    }
  };

  const downloadFile = (url: string, filename: string) => {
    window.open(url, '_blank');
    addToast(`Downloading ${filename}...`, 'success');
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Views', val: stats?.totalViews, icon: Activity, color: 'text-brand-primary' },
          { label: 'Pending Casting', val: stats?.pendingCasting, icon: Users, color: 'text-brand-secondary' },
          { label: 'Pending Sponsors', val: stats?.pendingSponsors, icon: DollarSign, color: 'text-yellow-400' },
          { label: 'Storage Used', val: stats?.totalContentSize, icon: Database, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:bg-white/5 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-mono text-gray-500">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{stat.val}</div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Activity size={18} className="text-brand-primary" /> 
          System Operations Log
        </h3>
        <div className="space-y-4">
          {stats?.recentActivity?.map((act: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                <span className="font-mono text-xs text-brand-primary uppercase">{act.type}</span>
                <span className="text-sm text-gray-300">{act.desc}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMovies = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Catalog Management</h2>
        <button 
          onClick={() => { setCurrentMovie({ id: '', title: '', genre: [], year: 2025, matchScore: 90, isFeaturedHome: false }); setIsEditingMovie(true); }}
          className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {isEditingMovie && (
        <div className="glass-panel p-6 rounded-xl border border-brand-primary/50 mb-8">
           <h3 className="text-lg font-bold mb-4 text-brand-primary">Edit Asset Metadata</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                className="input-field" placeholder="Title" 
                value={currentMovie.title} onChange={e => setCurrentMovie({...currentMovie, title: e.target.value})}
              />
              <div className="flex gap-2">
                 <input 
                  className="input-field" placeholder="Year" type="number"
                  value={currentMovie.year} onChange={e => setCurrentMovie({...currentMovie, year: parseInt(e.target.value)})}
                />
                 <input 
                  className="input-field" placeholder="Duration (e.g. 1h 20m)" 
                  value={currentMovie.duration} onChange={e => setCurrentMovie({...currentMovie, duration: e.target.value})}
                />
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                    <input 
                        type="checkbox" 
                        checked={currentMovie.isFeaturedHome || false}
                        onChange={e => setCurrentMovie({...currentMovie, isFeaturedHome: e.target.checked})}
                        className="w-4 h-4 accent-brand-primary"
                    />
                    <label className="text-sm text-gray-300">Feature on Home Page Hero</label>
               </div>
               <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                    <input 
                        type="checkbox" 
                        checked={currentMovie.isFeaturedMovies || false}
                        onChange={e => setCurrentMovie({...currentMovie, isFeaturedMovies: e.target.checked})}
                        className="w-4 h-4 accent-brand-primary"
                    />
                    <label className="text-sm text-gray-300">Feature in Catalog Carousel</label>
               </div>
           </div>
           
           {/* Additional Fields for Genre, Resolution, MatchScore */}
           <div className="grid grid-cols-3 gap-4 mb-4">
               <input 
                  className="input-field" placeholder="Resolution (HD/4K/8K)"
                  value={currentMovie.resolutionTag} onChange={e => setCurrentMovie({...currentMovie, resolutionTag: e.target.value as any})}
               />
               <input 
                  className="input-field" placeholder="Match Score (0-100)" type="number"
                  value={currentMovie.matchScore} onChange={e => setCurrentMovie({...currentMovie, matchScore: parseInt(e.target.value)})}
               />
               <input 
                  className="input-field" placeholder="Genre (Comma separated)"
                  value={currentMovie.genre?.join(', ')} 
                  onChange={e => setCurrentMovie({...currentMovie, genre: e.target.value.split(',').map(s => s.trim())})}
               />
           </div>

           <textarea 
              className="input-field mb-4 h-24" placeholder="Description"
              value={currentMovie.description} onChange={e => setCurrentMovie({...currentMovie, description: e.target.value})}
           />
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Movie Poster (Thumbnail)</label>
                  <div className="relative group">
                     {currentMovie.thumbnailUrl ? (
                         <div className="relative h-40 w-full rounded-lg overflow-hidden border border-white/10 group-hover:border-brand-primary/50 transition-colors">
                            <img src={currentMovie.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-sm font-bold">Change Image</span>
                            </div>
                         </div>
                     ) : (
                        <div className="h-40 w-full rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-brand-primary/50 hover:text-brand-primary transition-all bg-black/20">
                            {isUploadingPoster ? <Loader2 className="animate-spin" /> : <ImageIcon size={24} />}
                            <span className="text-xs mt-2">Upload Poster</span>
                        </div>
                     )}
                     <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handlePosterUpload}
                        disabled={isUploadingPoster}
                     />
                  </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Video Asset (Unlimited GCS)</label>
                 <div className="space-y-3">
                     <div className="relative group h-24 w-full rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-brand-primary/50 hover:text-brand-primary transition-all bg-black/20">
                        {isUploadingVideo ? (
                            <div className="flex flex-col items-center gap-1">
                                <Loader2 className="animate-spin text-brand-primary" />
                                <span className="text-[10px] text-brand-primary animate-pulse">Uploading... please wait</span>
                            </div>
                        ) : (
                            <>
                                <Video size={24} />
                                <span className="text-xs mt-2">Upload Source File (MP4)</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            accept="video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleVideoUpload}
                            disabled={isUploadingVideo}
                        />
                     </div>
                     <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest">- OR -</div>
                     <input 
                        className="input-field text-xs" 
                        placeholder="Paste External Video URL (YouTube/Vimeo/Drive)"
                        value={currentMovie.videoUrl || ''}
                        onChange={e => setCurrentMovie({...currentMovie, videoUrl: e.target.value.trim()})} 
                     />
                     {currentMovie.videoUrl && (
                         <div className="text-[10px] text-green-400 flex items-center gap-1">
                             <Check size={10} /> Video Source Linked
                         </div>
                     )}
                 </div>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button onClick={() => setIsEditingMovie(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleSaveMovie} className="btn-primary py-2 px-6">Save Changes</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movies.map(movie => (
          <div key={movie.id} className="glass-panel p-4 flex gap-4 items-start group">
            <img src={movie.thumbnailUrl} alt={movie.title} className="w-24 h-16 object-cover rounded bg-gray-800" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate text-white">{movie.title}</h4>
              <p className="text-xs text-gray-400 mb-2">{movie.year} • {movie.duration}</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { setCurrentMovie(movie); setIsEditingMovie(true); }}
                  className="text-xs bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary px-3 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteMovie(movie.id)}
                  className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
            {movie.isFeaturedHome && (
                <div className="text-[10px] bg-brand-primary text-black font-bold px-2 py-1 rounded">HERO</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubmissions = (type: 'casting' | 'sponsor') => {
    const list = type === 'casting' ? castingSubs : sponsorSubs;
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold capitalize">{type} Submissions</h2>
        <div className="glass-panel overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="p-4">Candidate / Org</th>
                <th className="p-4">Details</th>
                <th className="p-4">Files</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{sub.name || sub.orgName}</div>
                    <div className="text-xs text-gray-500">{sub.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300 max-w-xs truncate">{sub.bio || sub.message}</div>
                    <div className="text-xs text-brand-primary mt-1">{sub.socialHandle || sub.subject}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {sub.files?.map((f: any, i: number) => (
                        <button key={i} onClick={() => downloadFile(f.path, f.name)} title={f.name} className="p-2 bg-brand-surfaceHighlight rounded hover:text-brand-primary transition-colors">
                          {f.type.includes('audio') ? <FileAudio size={16} /> : <FileImage size={16} />}
                        </button>
                      ))}
                      {sub.logoUrl && (
                         <button onClick={() => downloadFile(sub.logoUrl, 'Logo')} className="p-2 bg-brand-surfaceHighlight rounded hover:text-brand-primary transition-colors">
                            <FileImage size={16} />
                         </button>
                      )}
                      {(!sub.files?.length && !sub.logoUrl) && <span className="text-gray-600">-</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      sub.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      sub.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {sub.status === 'new' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(sub.id, type, 'approved')}
                          disabled={!!processingId}
                          className="p-2 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50" title="Approve & Email"
                        >
                          {processingId === sub.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(sub.id, type, 'rejected')}
                          disabled={!!processingId}
                          className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50" title="Reject & Email"
                        >
                          {processingId === sub.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <div className="p-8 text-center text-gray-500">No submissions found.</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-brand-text font-sans">
      <LiveBackground />
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-wider text-white">MAINFRAME <span className="text-brand-primary text-xs align-top">V2.0</span></h1>
                <p className="text-[10px] text-gray-400 font-mono tracking-widest">ADMINISTRATOR ACCESS</p>
              </div>
          </div>

          <div className="flex items-center gap-4">
             <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-transparent hover:border-white/10 group">
                <Home size={18} className="group-hover:text-brand-primary transition-colors" />
                <span className="text-sm font-medium hidden sm:inline">Live Site</span>
             </Link>
             <div className="h-6 w-px bg-white/10 mx-2"></div>
             <button onClick={handleLogout} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Logout">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-8">
        <nav className="w-full md:w-64 flex-shrink-0 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'movies', label: 'Catalog / Movies', icon: Film },
              { id: 'casting', label: 'Casting Calls', icon: Users },
              { id: 'sponsors', label: 'Sponsorships', icon: DollarSign },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon size={18} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </button>
            ))}

            <div className="mt-8 pt-8 border-t border-white/5 px-4">
               <div className="text-xs text-gray-600 font-mono mb-2">SYSTEM STATUS</div>
               <div className="flex items-center gap-2 text-xs text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  OPERATIONAL
               </div>
            </div>
        </nav>

        <main className="flex-1 min-w-0">
           {loading ? (
             <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
             </div>
           ) : (
             <>
               {activeTab === 'dashboard' && renderDashboard()}
               {activeTab === 'movies' && renderMovies()}
               {activeTab === 'casting' && renderSubmissions('casting')}
               {activeTab === 'sponsors' && renderSubmissions('sponsor')}
             </>
           )}
        </main>
      </div>
    </div>
  );
};
