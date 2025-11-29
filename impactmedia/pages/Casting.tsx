import React, { useState } from 'react';
import { Upload, CheckCircle, Loader2, FileIcon, X, Mic, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { SOCIAL_PLATFORMS } from '../constants';
import { api } from '../services/api';
import { useToast } from '../App';
import { LiveBackground } from '../components/LiveBackground';

const GENDER_OPTIONS = [
  'Female',
  'Male',
  'Non-binary',
  'Transgender',
  'Intersex',
  'Prefer not to say',
  'Other'
];

export const Casting: React.FC = () => {
  const { addToast } = useToast();
  const initialFormState = {
    name: '',
    email: '',
    gender: 'Prefer not to say',
    socialHandle: '',
    socialPlatform: SOCIAL_PLATFORMS[0],
    bio: '',
    hasConsented: false,
    signature: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [files, setFiles] = useState<File[]>([]);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setFormData(initialFormState);
    setFiles([]);
    setFileProgress({});
    setSuccess(false);
    window.scrollTo(0, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of newFiles) {
        const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|avi|mkv)$/i);
        const isAudio = file.type.startsWith('audio') || file.name.match(/\.(mp3|wav|ogg)$/i);
        const isImage = file.type.startsWith('image');

        if (isVideo) {
          addToast(`Video files (${file.name}) are NOT allowed. Please upload MP3 audio.`, 'error');
          continue;
        }

        if (!isAudio && !isImage) {
           addToast(`File type not supported: ${file.name}`, 'error');
           continue;
        }

        validFiles.push(file);
      }

      if (files.length + validFiles.length > 10) {
        addToast('Maximum 10 files allowed in total.', 'error');
        return;
      }
      
      setFiles(prev => [...prev, ...validFiles].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (fileToRemove) {
        setFileProgress(prev => {
            const newState = { ...prev };
            delete newState[fileToRemove.name];
            return newState;
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hasConsented || !formData.signature) {
        addToast("Signature and consent are required.", "error");
        return;
    }
    if (files.length === 0) {
        addToast("Please upload at least one image or audio file.", "error");
        return;
    }

    setIsSubmitting(true);
    
    // Initialize progress for all files to 0
    const initialProgress: Record<string, number> = {};
    files.forEach(f => initialProgress[f.name] = 0);
    setFileProgress(initialProgress);

    try {
      const uploadedFiles = [];

      // Upload files sequentially to simulate individual progress
      for (const file of files) {
        // Mock progress simulation for this specific file
        const progressInterval = setInterval(() => {
            setFileProgress(prev => {
                const current = (prev[file.name] as number) || 0;
                // Cap random increment at 90% until fully done
                if (current >= 90) return prev;
                return { ...prev, [file.name]: current + Math.random() * 15 };
            });
        }, 200);

        const response = await api.uploads.uploadFile(file, 'casting');
        
        if (response.success) {
            uploadedFiles.push({
                name: file.name,
                type: file.type,
                path: response.path,
                url: response.url
            });
        }

        clearInterval(progressInterval);
        // Mark this file as complete
        setFileProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      // Submit metadata with uploaded file links
      await api.submissions.submitCasting({
          ...formData,
          files: uploadedFiles,
      });

      setSuccess(true);
      addToast("Casting profile submitted successfully!", "success");
      window.scrollTo(0,0);
    } catch (error) {
      console.error(error);
      addToast('Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressSum = Object.values(fileProgress).reduce((sum: number, val) => sum + (val as number), 0);
  const overallProgress = files.length > 0 ? progressSum / files.length : 0;

  if (success) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center relative overflow-hidden">
        <LiveBackground />
        <div className="glass-panel p-8 sm:p-10 rounded-2xl max-w-lg text-center border-brand-success/30 relative overflow-hidden z-10 mx-auto w-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-success" />
          <CheckCircle className="mx-auto text-brand-success mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" size={80} />
          <h2 className="text-2xl sm:text-3xl font-black mb-4">Submission Received</h2>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            Thank you, <span className="text-white font-bold">{formData.name}</span>. Your profile is now indexed in the AI Impact mainframe. 
            We will contact you if your archetype matches an upcoming production.
          </p>
          <button 
            onClick={resetForm} 
            className="mt-8 btn-secondary w-full"
          >
            Submit Another Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 text-brand-text relative overflow-hidden pb-20">
      <LiveBackground />

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-10 text-center">
            <h1 className="heading-hero text-4xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-2xl">CASTING CALL</h1>
            <p className="text-lg sm:text-xl text-brand-muted max-w-xl mx-auto">Join the next generation of synthetic and human performance.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Personal Info */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6 border-t border-brand-primary/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
                    <h3 className="text-xl font-bold text-white">Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                            required 
                            type="text" 
                            className="input-field"
                            placeholder="e.g. Alex Chen"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Gender Identity</label>
                        <select 
                            className="input-field appearance-none cursor-pointer"
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                            {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Email</label>
                        <input 
                            required 
                            type="email" 
                            className="input-field"
                            placeholder="contact@email.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Bio / Skills</label>
                        <textarea 
                            rows={1}
                            className="input-field resize-none h-[46px]"
                            placeholder="Briefly describe your experience..."
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
                    <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Primary Platform</label>
                        <select 
                            className="input-field appearance-none"
                            value={formData.socialPlatform}
                            onChange={e => setFormData({...formData, socialPlatform: e.target.value})}
                        >
                            {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Handle</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="@username"
                            className="input-field"
                            value={formData.socialHandle}
                            onChange={e => setFormData({...formData, socialHandle: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* File Upload */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-t border-brand-secondary/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-brand-secondary rounded-full shadow-[0_0_10px_rgba(112,0,255,0.8)]"></div>
                    <h3 className="text-xl font-bold text-white">Media Assets</h3>
                </div>

                <div className="relative border-2 border-dashed border-brand-border bg-brand-surface/30 rounded-xl p-6 sm:p-10 text-center hover:border-brand-primary/50 hover:bg-brand-surfaceHighlight transition-all group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <input 
                        type="file" 
                        multiple 
                        accept="image/png, image/jpeg, image/jpg, audio/mpeg, audio/mp3, audio/wav"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        disabled={isSubmitting}
                    />
                    <div className="flex flex-col items-center relative z-10">
                        <div className="flex gap-4 mb-4">
                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand-bg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/10">
                                <ImageIcon className="text-brand-primary" size={24} />
                            </div>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand-bg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/10 delay-75">
                                <Mic className="text-brand-secondary" size={24} />
                            </div>
                        </div>
                       
                        <p className="text-white font-bold text-base sm:text-lg mb-1">Upload Photos & Audio</p>
                        <p className="text-brand-muted text-xs sm:text-sm max-w-sm mx-auto mb-2">
                           Drag & drop or click to browse. Max 10 files.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                            <span className="bg-white/5 px-2 py-1 rounded">JPG/PNG</span>
                            <span className="bg-white/5 px-2 py-1 rounded">MP3/WAV</span>
                            <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 flex items-center gap-1">
                                <AlertTriangle size={10} /> NO VIDEO/MP4
                            </span>
                        </div>
                    </div>
                </div>
                
                {files.length > 0 && (
                    <div className="mt-6 space-y-3 animate-fade-in">
                        {files.map((f, idx) => {
                            const progress = fileProgress[f.name] || 0;
                            const isDone = progress === 100;
                            return (
                                <div key={idx} className="bg-brand-surfaceHighlight border border-brand-border p-3 rounded-lg text-sm group transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {f.type.startsWith('audio') ? (
                                                <Mic size={16} className="text-brand-secondary flex-shrink-0" />
                                            ) : (
                                                <ImageIcon size={16} className="text-brand-primary flex-shrink-0" />
                                            )}
                                            <span className="truncate text-gray-300 font-medium">{f.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isSubmitting && (
                                                <span className="text-xs font-mono text-brand-primary">{Math.round(progress)}%</span>
                                            )}
                                            {!isSubmitting && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFile(idx)} 
                                                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Individual File Progress Bar */}
                                    {isSubmitting && (
                                        <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${isDone ? 'bg-green-500' : 'bg-brand-primary'}`} 
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Consent */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Legal Release</h3>
                </div>

                <div className="flex items-start gap-4 mb-8 bg-brand-surfaceHighlight p-4 rounded-lg border border-white/5">
                    <input 
                        type="checkbox" 
                        required
                        id="consent"
                        checked={formData.hasConsented}
                        onChange={e => setFormData({...formData, hasConsented: e.target.checked})}
                        className="mt-1 w-5 h-5 accent-brand-primary cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="consent" className="text-xs sm:text-sm text-gray-300 cursor-pointer leading-relaxed">
                        I voluntarily submit my profile and media to AI Impact Media. I understand there is no immediate financial compensation and my likeness may be used for internal AI modeling and pre-visualization purposes.
                    </label>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Digital Signature</label>
                    <input 
                        required 
                        type="text" 
                        placeholder="Type your full legal name"
                        className="input-field font-mono text-brand-primary tracking-widest text-lg"
                        value={formData.signature}
                        onChange={e => setFormData({...formData, signature: e.target.value})}
                    />
                    <p className="text-right text-xs font-mono text-brand-muted mt-2 opacity-70">
                        TIMESTAMP: {new Date().toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Global Progress & Submit */}
            <div className="space-y-4">
                {isSubmitting && (
                    <div className="glass-panel p-4 rounded-xl border-brand-primary/30">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold uppercase text-brand-primary animate-pulse">Data Uplink Active</span>
                            <span className="text-sm font-mono text-white">{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                             />
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full btn-primary py-5 text-lg shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] relative overflow-hidden group disabled:opacity-80 disabled:cursor-wait"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
                    <span className="relative flex items-center justify-center gap-3">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" />
                            <span>TRANSMITTING...</span>
                        </>
                    ) : (
                        'SUBMIT PROFILE TO MAINFRAME'
                    )}
                    </span>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};