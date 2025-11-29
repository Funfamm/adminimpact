
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { GENRES, MOCK_MOVIES } from '../constants';
import { Search, Play, Filter, X, Loader2, AlertCircle, VideoOff, Plus, Check } from 'lucide-react';
import { Movie } from '../types';
import { useToast } from '../App';
import Hls from 'hls.js';

export const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  const { addToast } = useToast();
  const location = useLocation();
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);

  // Video Ref for HLS
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load watchlist from local storage
    const saved = localStorage.getItem('aim_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) { console.error('Watchlist parse error', e); }
    }

    const fetchMovies = async () => {
      try {
        const data = await api.admin.getMovies();
        setMovies(data);
        
        const autoPlayId = location.state?.autoPlayId;
        if (autoPlayId) {
            const movieToPlay = data.find(m => m.id === autoPlayId);
            if (movieToPlay) handlePlayClick(movieToPlay);
            window.history.replaceState({}, document.title);
        }
      } catch (error) {
        console.error("Failed to fetch movies", error);
        setMovies(MOCK_MOVIES as unknown as Movie[]); 
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Initialize HLS Player when modal opens
  useEffect(() => {
    let hls: Hls | null = null;

    if (playingMovie && playingMovie.videoUrl && videoRef.current) {
        const url = playingMovie.videoUrl;
        const isHls = url.endsWith('.m3u8');
        const videoElement = videoRef.current;

        if (isHls && Hls.isSupported()) {
            hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play().catch(e => console.log("Autoplay blocked:", e));
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native Safari HLS support
            videoElement.src = url;
            videoElement.addEventListener('loadedmetadata', () => {
                videoElement.play().catch(e => console.log("Autoplay blocked:", e));
            });
        } else {
             // Standard MP4
             videoElement.src = url;
             videoElement.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }

    return () => {
        if (hls) {
            hls.destroy();
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
            videoRef.current.load();
        }
    };
  }, [playingMovie]);

  const toggleWatchlist = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    let newWatchlist;
    if (watchlist.includes(movie.id)) {
      newWatchlist = watchlist.filter(id => id !== movie.id);
      addToast(`Removed "${movie.title}" from My List`, 'success');
    } else {
      newWatchlist = [...watchlist, movie.id];
      addToast(`Added "${movie.title}" to My List`, 'success');
    }
    setWatchlist(newWatchlist);
    localStorage.setItem('aim_watchlist', JSON.stringify(newWatchlist));
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesGenre = true;
    if (selectedGenre === 'My List') {
        matchesGenre = watchlist.includes(movie.id);
    } else if (selectedGenre !== 'All') {
        matchesGenre = movie.genre.includes(selectedGenre);
    }
    
    return matchesSearch && matchesGenre;
  });

  const handlePlayClick = (movie: Movie) => {
    if (!movie.videoUrl) {
        addToast(`Video source unavailable for "${movie.title}"`, 'error');
        return;
    }
    setPlayingMovie(movie);
  };

  const closePlayer = () => setPlayingMovie(null);

  const getEmbedUrl = (url: string) => {
      if (!url) return null;
      
      // 1. YouTube
      const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const ytMatch = url.match(ytRegex);
      if (ytMatch && ytMatch[1]) {
          const origin = window.location.origin;
          return { 
              type: 'iframe', 
              src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0&origin=${origin}` 
          };
      }
      
      // 2. Vimeo
      if (url.includes('vimeo.com')) {
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
          if (vimeoMatch && vimeoMatch[1]) {
             return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
          }
      }

      // 3. Google Drive
      if (url.includes('drive.google.com')) {
          const driveMatch = url.match(/file\/d\/([^\/]+)/);
          if (driveMatch && driveMatch[1]) {
              return { type: 'iframe', src: `https://drive.google.com/file/d/${driveMatch[1]}/preview?autoplay=1` };
          }
      }

      // 4. HLS / MP4 Direct
      return { type: 'video', src: url };
  };

  const MovieSkeleton = () => (
    <div className="rounded-xl overflow-hidden glass-panel h-full flex flex-col">
       <div className="aspect-[16/9] bg-brand-surfaceHighlight animate-pulse"></div>
       <div className="p-4 space-y-3 flex-grow">
          <div className="h-6 bg-brand-surfaceHighlight rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-brand-surfaceHighlight rounded w-full animate-pulse"></div>
          <div className="h-4 bg-brand-surfaceHighlight rounded w-1/2 animate-pulse"></div>
          <div className="flex gap-2 pt-2">
             <div className="h-5 w-16 bg-brand-surfaceHighlight rounded animate-pulse"></div>
             <div className="h-5 w-16 bg-brand-surfaceHighlight rounded animate-pulse"></div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="page-container pb-20 relative">
        {playingMovie && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
                <button 
                    onClick={closePlayer}
                    className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-[110]"
                >
                    <X size={32} />
                </button>
                <div className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)] border border-brand-primary/20 relative group">
                    {(() => {
                        if (!playingMovie.videoUrl) return (
                            <div className="flex flex-col items-center justify-center h-full text-brand-muted">
                                <AlertCircle size={48} className="mb-4 text-brand-secondary" />
                                <p className="text-xl">Stream source unavailable.</p>
                            </div>
                        );
                        const source = getEmbedUrl(playingMovie.videoUrl);
                        
                        if (source?.type === 'iframe') {
                            return (
                                <iframe 
                                    src={source.src} 
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                                    allowFullScreen
                                />
                            );
                        } else {
                            // Enhanced Self-Hosted Player (MP4 / HLS)
                            return (
                                <video 
                                    ref={videoRef}
                                    controls 
                                    autoPlay 
                                    className="w-full h-full object-contain"
                                    controlsList="nodownload"
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            );
                        }
                    })()}
                </div>
            </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12 gap-6">
            <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
                    CATALOG
                </h1>
                <p className="text-brand-muted text-sm sm:text-base">Explore the boundaries of digital storytelling.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search titles..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                    <select 
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="input-field pl-10 appearance-none cursor-pointer hover:bg-brand-surface transition-colors"
                    >
                        <option value="All">All Genres</option>
                        <option value="My List">My List (Watchlist)</option>
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <MovieSkeleton key={n} />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {filteredMovies.map(movie => {
                    const isInList = watchlist.includes(movie.id);
                    return (
                        <div key={movie.id} className="glass-panel rounded-xl overflow-hidden hover:border-brand-primary/40 transition-all duration-500 group flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/10 relative">
                            <div className="relative aspect-[16/9] overflow-hidden bg-brand-surfaceHighlight">
                                <img 
                                    src={movie.thumbnailUrl} 
                                    alt={movie.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                    {movie.videoUrl ? (
                                        <button 
                                            onClick={() => handlePlayClick(movie)}
                                            className="bg-brand-primary text-black rounded-full p-4 hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                                            title="Play Now"
                                        >
                                            <Play fill="black" className="ml-1" />
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <VideoOff size={32} />
                                            <span className="text-xs font-bold mt-2 uppercase tracking-widest">Coming Soon</span>
                                        </div>
                                    )}
                                    <button 
                                        onClick={(e) => toggleWatchlist(e, movie)}
                                        className={`rounded-full p-3 border-2 transition-all hover:scale-110 ${isInList ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-gray-400 text-gray-200 hover:border-brand-secondary hover:text-brand-secondary'}`}
                                        title={isInList ? "Remove from List" : "Add to List"}
                                    >
                                        {isInList ? <Check size={20} /> : <Plus size={20} />}
                                    </button>
                                </div>
                                <span className="absolute top-2 right-2 bg-black/70 backdrop-blur text-xs font-mono text-brand-primary border border-brand-primary/30 px-2 py-1 rounded">
                                    {movie.resolutionTag}
                                </span>
                            </div>
                            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                <div className="mb-2">
                                    <h3 className="font-bold text-lg leading-tight text-brand-text group-hover:text-brand-primary transition-colors">{movie.title}</h3>
                                </div>
                                <p className="text-brand-muted text-sm line-clamp-2 mb-4 flex-grow">{movie.description}</p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {movie.genre.map(g => (
                                        <span key={g} className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
        
        {!loading && filteredMovies.length === 0 && (
            <div className="text-center py-20 sm:py-32 text-gray-500 glass-panel rounded-2xl border-dashed mx-4 sm:mx-0">
                <p className="text-lg sm:text-xl">No titles found matching your criteria.</p>
                <button onClick={() => {setSearchTerm(''); setSelectedGenre('All');}} className="text-brand-primary mt-2 hover:underline">
                    Reset Filters
                </button>
            </div>
        )}
    </div>
  );
};
