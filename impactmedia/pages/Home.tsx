
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, ChevronRight, Loader2, Plus, Check } from 'lucide-react';
import { api } from '../services/api';
import { Movie } from '../types';
import { useToast } from '../App';

export const Home: React.FC = () => {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [myListMovies, setMyListMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    // Load watchlist
    const saved = localStorage.getItem('aim_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }

    const loadContent = async () => {
      try {
        const movies = await api.public.getMovies();
        
        const featured = movies.find(m => m.isFeaturedHome) || movies[0];
        setFeaturedMovie(featured);
        setTrendingMovies(movies.slice(0, 4));

        // Derive My List from full movie data
        if (saved) {
             const ids = JSON.parse(saved);
             setMyListMovies(movies.filter(m => ids.includes(m.id)));
        }

      } catch (error) {
        console.error("Content load failed", error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const toggleWatchlist = (movie: Movie) => {
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
    
    // Update local list for UI immediate feedback
    if (featuredMovie && movie.id === featuredMovie.id) {
       // Just forces re-render via watchlist dependency usually, but we also update myListMovies state
       // We'll just reload from the filtering logic if needed, but for hero toggle, just state update is enough
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-brand-bg flex items-center justify-center">
              <Loader2 className="animate-spin text-brand-primary" size={48} />
          </div>
      );
  }

  if (!featuredMovie) {
       return (
          <div className="min-h-screen bg-brand-bg flex items-center justify-center flex-col text-center px-4">
              <h1 className="text-3xl font-bold text-white mb-2">System Offline</h1>
              <p className="text-gray-400">No content available in the mainframe.</p>
          </div>
      );
  }

  const isFeaturedInList = watchlist.includes(featuredMovie.id);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {/* Hero Section */}
      <div className="relative h-[85vh] sm:h-[90vh] min-h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-brand-bg">
            <img 
              src={featuredMovie.thumbnailUrl} 
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-transparent to-transparent z-10" />
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-12 lg:px-20 pt-20">
          <div className="max-w-4xl space-y-4 sm:space-y-6">
            <span className="inline-block bg-brand-secondary/90 text-white text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded shadow-[0_0_15px_rgba(112,0,255,0.6)] uppercase tracking-widest mb-2 border border-brand-secondary/50">
              Featured Premiere
            </span>
            
            <h1 className="heading-hero text-4xl sm:text-5xl md:text-7xl leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              {featuredMovie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm md:text-base font-medium text-gray-300">
              <span className="text-brand-success flex items-center gap-1">
                <Star size={16} fill="currentColor" /> {featuredMovie.matchScore}% Match
              </span>
              <span>{featuredMovie.year}</span>
              <span className="border border-brand-border px-2 py-0.5 rounded text-[10px] sm:text-xs bg-brand-surface/50 backdrop-blur-sm">
                {featuredMovie.resolutionTag}
              </span>
              <span>{featuredMovie.duration}</span>
              {featuredMovie.genre.map(g => (
                  <span key={g} className="text-[10px] sm:text-xs text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                      {g}
                  </span>
              ))}
            </div>

            <p className="max-w-xl text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-md line-clamp-3 sm:line-clamp-none">
              {featuredMovie.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 sm:pt-4">
              <Link 
                to={`/movies`} 
                state={{ autoPlayId: featuredMovie.id }}
                className="btn-primary flex items-center gap-2 group text-sm sm:text-base py-2.5 sm:py-3 px-5 sm:px-6"
              >
                <Play fill="black" size={20} className="group-hover:scale-110 transition-transform" />
                PLAY NOW
              </Link>
              <button 
                onClick={() => toggleWatchlist(featuredMovie)}
                className={`btn-secondary flex items-center gap-2 group text-sm sm:text-base py-2.5 sm:py-3 px-5 sm:px-6 ${isFeaturedInList ? 'border-brand-primary text-brand-primary' : ''}`}
              >
                {isFeaturedInList ? <Check size={20} /> : <Plus size={20} />}
                {isFeaturedInList ? 'IN MY LIST' : 'MY LIST'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="relative z-30 -mt-20 pb-16 sm:pb-20 px-4 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Casting Call', link: '/casting', desc: 'Join the cast', bg: 'from-blue-600/80 to-blue-900/80' },
            { title: 'Sponsors', link: '/sponsors', desc: 'Partner with us', bg: 'from-purple-600/80 to-purple-900/80' },
            { title: 'Movies', link: '/movies', desc: 'Watch Now', bg: 'from-brand-primary/80 to-teal-900/80' },
            { title: 'Donate', link: '/donate', desc: 'Support Art', bg: 'from-emerald-600/80 to-emerald-900/80' },
          ].map((item) => (
            <Link 
              key={item.title}
              to={item.link}
              className={`glass-panel p-5 sm:p-6 rounded-xl hover:bg-brand-surfaceHighlight transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden relative`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold tracking-wider group-hover:text-brand-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-brand-muted uppercase tracking-widest">{item.desc}</p>
                </div>
            </Link>
          ))}
        </div>
      </div>

      {/* My List Section (Only if items exist) */}
      {myListMovies.length > 0 && (
          <div className="px-4 sm:px-12 lg:px-20 py-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">My List</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {myListMovies.slice(0, 4).map(movie => (
                    <Link to="/movies" key={movie.id} className="group relative aspect-video bg-brand-surface rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-brand-primary/20 transition-all duration-500 hover:-translate-y-1">
                        <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                            <h4 className="font-bold text-white text-base">{movie.title}</h4>
                        </div>
                    </Link>
                ))}
            </div>
          </div>
      )}

      {/* Trending Section */}
      <div className="px-4 sm:px-12 lg:px-20 py-8 sm:py-10">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white relative inline-block">
                Trending Now
                <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-brand-primary rounded-full"></div>
            </h2>
            <Link to="/movies" className="text-xs sm:text-sm text-brand-primary hover:text-white transition-colors flex items-center gap-1">
                View All <ChevronRight size={16} />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingMovies.map(movie => (
                <Link to="/movies" key={movie.id} className="group relative aspect-video bg-brand-surface rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-brand-primary/20 transition-all duration-500 hover:-translate-y-1">
                    <img 
                        src={movie.thumbnailUrl} 
                        alt={movie.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="font-bold text-white text-base sm:text-lg leading-tight mb-1">{movie.title}</h4>
                        <div className="flex justify-between items-center text-xs text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                            <span>{movie.duration}</span>
                            <div className="flex items-center gap-1 text-brand-primary">
                                <Star size={12} fill="currentColor"/>
                                <span>{movie.matchScore}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
