
import React, { useState, useEffect } from 'react';
import { SystemLayout } from './SystemLayout';
import { STARTING_CLASSES } from '../constants';
import { PlayerStats } from '../types';
import { playSystemSound } from '../services/audioService';

interface AuthScreenProps {
  onLogin: (name: string, stats?: Partial<PlayerStats>) => Promise<boolean>; // Made Async
  storedName?: string;
}

type AuthState = 
  | 'BOOT' 
  | 'MENU' 
  | 'LOGIN' 
  | 'SIGNUP_NAME' 
  | 'SIGNUP_PROFILE' 
  | 'SIGNUP_GOALS'   
  | 'SIGNUP_CLASS' 
  | 'SIGNUP_SYNC' 
  | 'SIGNUP_FREQUENCY'
  | 'SIGNUP_DAYS'
  | 'SIGNUP_NOTIFICATIONS'
  | 'SIGNUP_SHOWCASE'
  | 'SIGNUP_CONFIRMATION'
  | 'AWAKENING';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GENDER_OPTIONS = ["Male", "Female", "Non-Binary"];
const GOAL_OPTIONS = ["Build Muscle", "Lose Fat", "Maintain Physique", "Increase Strength", "Improve Endurance"];
const ACTIVITY_OPTIONS = ["Sedentary", "Lightly Active", "Moderate", "Very Active", "Extra Active"];
const MOTIVATION_OPTIONS = ["Discipline", "Health", "Aesthetics", "Strength", "Competition", "Mental Clarity"];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, storedName }) => {
  const [authState, setAuthState] = useState<AuthState>('BOOT');
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [verifying, setVerifying] = useState(false); // New state for async check
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Profile Data
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Goals Data
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [motivation, setMotivation] = useState(MOTIVATION_OPTIONS[0]);
  const [activityLevel, setActivityLevel] = useState(ACTIVITY_OPTIONS[2]);
  const [autoDistribute, setAutoDistribute] = useState(false); 

  // Onboarding Data
  const [frequency, setFrequency] = useState(3);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [notifications, setNotifications] = useState({
    workouts: true,
    tips: true,
    reports: true,
  });

  // Boot Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthState('MENU');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSignupComplete = () => {
    setAuthState('AWAKENING');
    
    setTimeout(() => {
        const selectedClass = STARTING_CLASSES.find(c => c.id === selectedClassId);
        
        // Construct stats
        const finalStats: Partial<PlayerStats> = {
            ...selectedClass?.bonusStats,
            job: selectedClass?.name,
            trainingFrequency: frequency,
            trainingDays: selectedDays,
            notifications: notifications,
            // Profile & Goals
            age: parseInt(age) || 25,
            gender: gender,
            height: `${heightFt}' ${heightIn}"`,
            weight: weight ? `${weight} lbs` : "160 lbs",
            targetWeight: targetWeight ? `${targetWeight} lbs` : undefined,
            goal: goal,
            motivation: motivation,
            activityLevel: activityLevel,
            autoDistributeStats: autoDistribute
        };

        onLogin(name, finalStats);
    }, 3000);
  };

  const handleResumeClick = () => {
      playSystemSound('click');
      if (storedName) setName(storedName);
      setAuthState('LOGIN');
  };

  const handleLoginSubmit = async () => {
      if(!name || verifying) return;
      
      setVerifying(true);
      
      try {
          const success = await onLogin(name);
          if (success) {
              playSystemSound('success');
              // onLogin handles state transition in App.tsx
          } else {
              playSystemSound('glitch');
              setLoginError(true);
              setTimeout(() => setLoginError(false), 2000);
          }
      } catch (e) {
          setLoginError(true);
      } finally {
          setVerifying(false);
      }
  };

  const handleFrequencyNext = () => {
      // Intelligent Pre-selection based on frequency
      let preSelected: string[] = [];
      if (frequency === 1) preSelected = ['Wed'];
      else if (frequency === 2) preSelected = ['Tue', 'Fri'];
      else if (frequency === 3) preSelected = ['Mon', 'Wed', 'Fri'];
      else if (frequency === 4) preSelected = ['Mon', 'Tue', 'Thu', 'Fri'];
      else if (frequency === 5) preSelected = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      else if (frequency === 6) preSelected = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      else if (frequency === 7) preSelected = DAYS_OF_WEEK;
      
      setSelectedDays(preSelected);
      setAuthState('SIGNUP_DAYS');
  };

  // Helper for toggle switch
  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-blue-500' : 'bg-gray-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
  );

  const ProgressBar = ({ step }: { step: number }) => (
    <div className="absolute top-0 left-0 w-full h-1 bg-gray-900">
       <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(step / 9) * 100}%` }}></div>
    </div>
  );

  if (authState === 'BOOT') {
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center space-y-4">
              <div className="text-blue-500 font-mono text-xl animate-pulse tracking-widest">SYSTEM INITIALIZING...</div>
              <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-[width_2s_ease-in-out_forwards] w-0"></div>
              </div>
          </div>
      );
  }

  if (authState === 'AWAKENING') {
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-900/10 animate-pulse"></div>
               <div className="z-10 text-center px-4">
                   <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-in fade-in zoom-in duration-1000 uppercase break-words">
                       WELCOME, {name || 'PLAYER'}.
                   </h1>
                   <p className="text-blue-400 font-mono text-sm tracking-[0.5em] animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">PREPARING INTERFACE</p>
               </div>
          </div>
      );
  }

  // Feature Showcase (The "Level Up" Screen)
  if (authState === 'SIGNUP_SHOWCASE') {
      return (
          <div className="h-screen w-screen bg-black text-white flex flex-col relative overflow-hidden animate-in fade-in duration-500">
              
              {/* Header */}
              <div className="flex justify-between items-center p-4 z-20">
                  <button onClick={() => setAuthState('SIGNUP_NOTIFICATIONS')} className="text-gray-500 text-sm font-bold uppercase tracking-wider hover:text-white">Back</button>
                  <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8 z-10 overflow-y-auto scrollbar-hide">
                  
                  {/* Badge */}
                  <div className="mb-6">
                      <span className="px-4 py-1.5 rounded-full border border-blue-500 text-blue-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          Player Authority
                      </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto bg-blue-900/20 border-2 border-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                      </div>
                      <h1 className="text-4xl font-bold text-white mb-3">Level Up</h1>
                      <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                          Get unlimited access to Daily Quests, Guild Leaderboards, Extensive Workout Library, Streak Tracking, and Recovery Progress.
                      </p>
                  </div>

                  {/* Hero Image / Silhouette */}
                  <div className="w-full max-w-sm aspect-[4/3] relative rounded-lg overflow-hidden border border-purple-900/50 shadow-[0_0_30px_rgba(88,28,135,0.4)] mb-8 group">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-gray-900 to-black"></div>
                      
                      {/* Animated Particles */}
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      
                      {/* Character Silhouette (CSS Constructed) */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-56 bg-black z-10" style={{ clipPath: 'polygon(20% 100%, 80% 100%, 100% 20%, 50% 0%, 0% 20%)' }}>
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/50 to-transparent"></div>
                      </div>
                      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                      
                      {/* Shadow Aura */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20"></div>
                      
                      <div className="absolute bottom-4 left-0 right-0 text-center z-30">
                           <span className="text-purple-300 text-xs uppercase tracking-[0.3em] font-bold">Shadow Monarch Class</span>
                      </div>
                  </div>

                  {/* Pricing / Action Area - REPLACED with Lore Action */}
                  <div className="w-full max-w-sm space-y-4">
                       <div className="flex justify-center space-x-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
                           <span>• No Subscription Required</span>
                           <span>• Full System Access</span>
                       </div>

                      <button 
                        onClick={() => setAuthState('SIGNUP_CONFIRMATION')}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] transform hover:scale-[1.02] transition-all duration-300"
                      >
                          Start My Journey
                      </button>
                      
                      <p className="text-[10px] text-gray-600 text-center px-4">
                          By continuing, you agree to follow the System's rules and complete all daily directives.
                      </p>
                  </div>
              </div>
          </div>
      );
  }

  // The "Player Acceptance" Modal - Special Case
  if (authState === 'SIGNUP_CONFIRMATION') {
      return (
          <div className="h-screen w-screen bg-black/90 flex flex-col items-center justify-center relative p-6">
              <div className="w-full max-w-sm border-2 border-blue-500 bg-black/80 backdrop-blur-sm p-6 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-in zoom-in duration-300">
                  <div className="flex flex-col items-center text-center space-y-6">
                      
                      <div className="w-full bg-blue-600 py-2">
                          <h3 className="text-black font-bold text-lg uppercase tracking-widest flex items-center justify-center space-x-2">
                              <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>
                              <span>Notification</span>
                          </h3>
                      </div>

                      <div className="space-y-4 py-4">
                          <p className="text-white text-lg font-medium leading-relaxed">
                              You have acquired the qualifications to be a <span className="text-blue-400 font-bold">Player</span>.
                          </p>
                          <p className="text-gray-400 text-sm">
                              Will you accept?
                          </p>
                      </div>

                      <button 
                        onClick={handleSignupComplete}
                        className="w-full py-4 bg-transparent border-2 border-blue-500 text-blue-500 text-xl font-bold uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      >
                          YES
                      </button>
                      
                      {/* Decorative "No" hidden/disabled as per system lore */}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
               backgroundImage: `linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
           }}>
        </div>

        <div className="relative z-10 w-full max-w-md">
            
            {/* Header / Logo Area - Only show on Menu/Login */}
            {(authState === 'MENU' || authState === 'LOGIN') && (
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-white tracking-tighter mb-2 system-text-shadow">LEVELING</h1>
                    <div className="h-0.5 w-24 bg-blue-500 mx-auto mb-2"></div>
                    <p className="text-blue-400 text-xs tracking-[0.4em] uppercase">System Interface</p>
                </div>
            )}

            <SystemLayout className="min-h-[400px] flex flex-col relative overflow-hidden">
                
                {/* MENU STATE */}
                {authState === 'MENU' && (
                    <div className="flex flex-col justify-center h-full space-y-4 animate-in fade-in duration-500 p-4">
                        <button 
                            onClick={handleResumeClick}
                            className="w-full py-4 border border-blue-500/50 bg-blue-900/10 hover:bg-blue-900/30 text-white font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 group"
                        >
                            <span className="group-hover:text-blue-400 transition-colors">Resume System</span>
                        </button>
                         <button 
                            onClick={() => setAuthState('SIGNUP_NAME')}
                            className="w-full py-4 border border-gray-700 bg-gray-900/10 hover:bg-gray-800 text-gray-300 font-bold tracking-widest uppercase transition-all"
                        >
                            Player Awakening
                        </button>
                    </div>
                )}

                {/* LOGIN STATE */}
                {authState === 'LOGIN' && (
                    <div className="flex flex-col justify-center h-full space-y-6 animate-in slide-in-from-right-10 duration-300 p-4">
                        <div className="text-center">
                            <h2 className="text-blue-400 font-bold uppercase tracking-widest mb-4">Identity Verification</h2>
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-6">Enter subject name to unlock</p>
                        </div>
                        <div>
                             <input 
                                type="text" 
                                value={name}
                                disabled={verifying}
                                onChange={(e) => { setName(e.target.value); setLoginError(false); }}
                                className={`w-full bg-black border text-white px-4 py-3 text-center font-bold tracking-widest focus:outline-none transition-all
                                    ${loginError ? 'border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.5)]'}
                                    ${verifying ? 'opacity-50 cursor-wait' : ''}
                                `}
                                placeholder="PLAYER NAME"
                                onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                            />
                            {loginError && (
                                <p className="text-red-500 text-center text-xs font-mono mt-2 animate-pulse">ACCESS DENIED: IDENTITY UNKNOWN</p>
                            )}
                        </div>
                        <div className="flex space-x-2 pt-4">
                            <button disabled={verifying} onClick={() => { setAuthState('MENU'); setLoginError(false); setName(''); }} className="flex-1 py-3 border border-gray-700 text-gray-500 hover:text-white uppercase text-xs font-bold disabled:opacity-50">Back</button>
                            <button 
                                onClick={handleLoginSubmit} 
                                disabled={verifying}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-black uppercase text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(37,99,235,0.5)] flex items-center justify-center disabled:opacity-50 disabled:cursor-wait"
                            >
                                {verifying ? <span className="animate-spin mr-2">⟳</span> : null}
                                {verifying ? 'VERIFYING...' : 'VERIFY'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ... (Existing Signup Flow Logic Remains Unchanged below this point) ... */}
                
                {/* STEP 1: NAME */}
                {authState === 'SIGNUP_NAME' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={1} />
                        <div className="flex-1 flex flex-col justify-center p-6 space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">Enter Designation</h2>
                                <p className="text-gray-500 text-sm">How shall the System address you?</p>
                            </div>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-blue-500 text-white text-2xl py-2 text-center font-bold focus:outline-none focus:border-blue-400 placeholder-gray-800"
                                placeholder="Name"
                                autoFocus
                            />
                        </div>
                        <div className="p-4 border-t border-gray-800 flex justify-end">
                            <button 
                                onClick={() => name && setAuthState('SIGNUP_PROFILE')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!name}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: PROFILE (BIOMETRICS) */}
                {authState === 'SIGNUP_PROFILE' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={2} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_NAME')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">Biometric Scan</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-blue-400 uppercase mb-2">Age</label>
                                    <input 
                                        type="number" 
                                        value={age} 
                                        onChange={(e) => setAge(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:border-blue-500 focus:outline-none text-center font-mono" 
                                        placeholder="25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-blue-400 uppercase mb-2">Gender</label>
                                    <select 
                                        value={gender} 
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm appearance-none"
                                    >
                                        {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-blue-400 uppercase mb-2">Height</label>
                                <div className="flex space-x-2">
                                    <div className="flex-1 flex items-center bg-gray-900 border border-gray-700 px-3 py-2">
                                        <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full bg-transparent text-white text-center font-mono focus:outline-none" />
                                        <span className="text-gray-500 text-xs ml-1">FT</span>
                                    </div>
                                    <div className="flex-1 flex items-center bg-gray-900 border border-gray-700 px-3 py-2">
                                        <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full bg-transparent text-white text-center font-mono focus:outline-none" />
                                        <span className="text-gray-500 text-xs ml-1">IN</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-blue-400 uppercase mb-2">Current Weight</label>
                                    <div className="flex items-center bg-gray-900 border border-gray-700 px-3 py-2">
                                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-transparent text-white text-center font-mono focus:outline-none" placeholder="160" />
                                        <span className="text-gray-500 text-xs ml-1">LBS</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase mb-2">Target Weight</label>
                                    <div className="flex items-center bg-gray-900 border border-gray-700 px-3 py-2">
                                        <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="w-full bg-transparent text-white text-center font-mono focus:outline-none" placeholder="Opt." />
                                        <span className="text-gray-500 text-xs ml-1">LBS</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={() => setAuthState('SIGNUP_GOALS')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                                Confirm Data
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: GOALS (OBJECTIVES) */}
                {authState === 'SIGNUP_GOALS' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={3} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_PROFILE')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">Mission Parameters</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            <div>
                                <label className="block text-[10px] text-blue-400 uppercase mb-2">Primary Objective</label>
                                <div className="space-y-2">
                                    {GOAL_OPTIONS.map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => setGoal(opt)}
                                            className={`w-full py-3 px-4 text-left text-xs font-bold uppercase transition-all border
                                                ${goal === opt 
                                                    ? 'bg-blue-900/30 border-blue-500 text-white' 
                                                    : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'}
                                            `}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-900/50 border border-gray-800 rounded">
                                <div>
                                    <h4 className="text-white text-xs font-bold uppercase">Stat Allocation</h4>
                                    <p className="text-[10px] text-gray-500">{autoDistribute ? 'Automatic (Based on Class)' : 'Manual (Player Choice)'}</p>
                                </div>
                                <Toggle active={autoDistribute} onToggle={() => setAutoDistribute(!autoDistribute)} />
                            </div>

                            <div>
                                <label className="block text-[10px] text-blue-400 uppercase mb-2">Motivation</label>
                                <select 
                                    value={motivation} 
                                    onChange={(e) => setMotivation(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-3 focus:border-blue-500 focus:outline-none text-xs uppercase font-bold appearance-none"
                                >
                                    {MOTIVATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] text-blue-400 uppercase mb-2">Current Activity Level</label>
                                <select 
                                    value={activityLevel} 
                                    onChange={(e) => setActivityLevel(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-3 focus:border-blue-500 focus:outline-none text-xs uppercase font-bold appearance-none"
                                >
                                    {ACTIVITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={() => setAuthState('SIGNUP_CLASS')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                                Set Parameters
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: CLASS */}
                {authState === 'SIGNUP_CLASS' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={4} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_GOALS')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">Select Combat Class</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {STARTING_CLASSES.map((cls) => (
                                    <div 
                                        key={cls.id}
                                        onClick={() => setSelectedClassId(cls.id)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 relative group
                                            ${selectedClassId === cls.id 
                                                ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(37,99,235,0.4)] transform scale-[1.02]' 
                                                : 'border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-3xl filter drop-shadow-md">{cls.icon}</div>
                                            {selectedClassId === cls.id && (
                                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold uppercase tracking-wider text-sm ${selectedClassId === cls.id ? 'text-blue-300' : 'text-white'}`}>{cls.name}</h3>
                                            <p className="text-[10px] text-gray-400 mt-1 leading-snug">{cls.description}</p>
                                        </div>
                                        
                                        <div className="mt-3 pt-2 border-t border-gray-700/50 flex flex-wrap gap-2">
                                            {Object.entries(cls.bonusStats).map(([k,v]) => (
                                                <span key={k} className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold
                                                    ${selectedClassId === cls.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}
                                                `}>{k.substring(0,3)} +{v}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={() => selectedClassId && setAuthState('SIGNUP_SYNC')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50"
                                disabled={!selectedClassId}
                            >
                                Confirm Class
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: SYNC */}
                {authState === 'SIGNUP_SYNC' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={5} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_CLASS')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">System Link</h2>
                        </div>
                        <div className="flex-1 p-6 flex flex-col space-y-6 justify-center">
                            <p className="text-gray-300 text-center text-sm font-light mb-4 px-4">
                                "The System tracks your growth. Enable biometric data for maximum efficiency."
                            </p>
                            
                            <div className="p-5 bg-black border border-blue-500/40 rounded-lg flex items-start space-x-4 hover:bg-blue-900/10 transition-colors">
                                <div className="p-3 bg-blue-900/20 rounded-full text-blue-400 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase text-sm tracking-wide">Auto-Logging</h4>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Completed workouts are automatically saved to the System Core database.</p>
                                </div>
                            </div>

                            <div className="p-5 bg-black border border-blue-500/40 rounded-lg flex items-start space-x-4 hover:bg-blue-900/10 transition-colors">
                                <div className="p-3 bg-blue-900/20 rounded-full text-blue-400 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase text-sm tracking-wide">Cross-Platform</h4>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Synchronizes step count and calorie data with Google Fit.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={() => setAuthState('SIGNUP_FREQUENCY')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                                Initiate Sync
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 6: FREQUENCY */}
                {authState === 'SIGNUP_FREQUENCY' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={6} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_SYNC')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">Training Frequency</h2>
                        </div>
                        <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-10">
                            <div className="text-center">
                                <h3 className="text-6xl font-black text-white mb-2 font-mono">{frequency}</h3>
                                <p className="text-lg text-blue-400 font-bold uppercase tracking-widest">Days Per Week</p>
                                <p className="text-xs text-gray-500 mt-4 max-w-xs mx-auto">
                                    The System will optimize your schedule based on this target.
                                </p>
                            </div>
                            
                            <div className="w-full px-4">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="7" 
                                    step="1" 
                                    value={frequency}
                                    onChange={(e) => setFrequency(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono font-bold uppercase">
                                    <span>Casual</span>
                                    <span>Moderate</span>
                                    <span>Extreme</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={handleFrequencyNext} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                                Set Schedule
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 7: DAYS */}
                {authState === 'SIGNUP_DAYS' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={7} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_FREQUENCY')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">Confirm Days</h2>
                        </div>
                        <div className="flex-1 p-6 flex flex-col items-center justify-center">
                            <p className="text-sm text-gray-400 mb-8 text-center">
                                Verify your active duty days.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-3 max-w-xs">
                                {DAYS_OF_WEEK.map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => {
                                            if (selectedDays.includes(day)) {
                                                setSelectedDays(selectedDays.filter(d => d !== day));
                                            } else {
                                                setSelectedDays([...selectedDays, day]);
                                            }
                                        }}
                                        className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 border-2
                                            ${selectedDays.includes(day) 
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-110' 
                                                : 'bg-gray-900 border-gray-800 text-gray-600 hover:border-gray-600'}
                                        `}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-blue-400 font-mono text-xl font-bold">
                                    {selectedDays.length} / {frequency}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Days Selected</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={() => setAuthState('SIGNUP_NOTIFICATIONS')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                                Confirm Schedule
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 8: NOTIFICATIONS */}
                {authState === 'SIGNUP_NOTIFICATIONS' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <ProgressBar step={8} />
                        <div className="p-4 border-b border-gray-800 flex items-center">
                             <button onClick={() => setAuthState('SIGNUP_DAYS')} className="text-gray-500 hover:text-white mr-4">←</button>
                             <h2 className="font-bold uppercase tracking-wider">Stay On Track</h2>
                        </div>
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            <p className="text-sm text-gray-400 mb-2">
                                Enable notifications to get reminders, tips, and progress reports.
                            </p>

                            <div className="p-4 bg-gray-900/50 border border-gray-800 rounded flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-900/30 rounded-full text-blue-400">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Workout Reminders</h4>
                                        <p className="text-[10px] text-gray-500 max-w-[150px]">Get notified on training days.</p>
                                    </div>
                                </div>
                                <Toggle active={notifications.workouts} onToggle={() => setNotifications({...notifications, workouts: !notifications.workouts})} />
                            </div>

                             <div className="p-4 bg-gray-900/50 border border-gray-800 rounded flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-yellow-900/30 rounded-full text-yellow-400">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Training Tips</h4>
                                        <p className="text-[10px] text-gray-500 max-w-[150px]">Tips on form and nutrition.</p>
                                    </div>
                                </div>
                                <Toggle active={notifications.tips} onToggle={() => setNotifications({...notifications, tips: !notifications.tips})} />
                            </div>

                             <div className="p-4 bg-gray-900/50 border border-gray-800 rounded flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-900/30 rounded-full text-green-400">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Progress Reports</h4>
                                        <p className="text-[10px] text-gray-500 max-w-[150px]">Weekly summaries of achievements.</p>
                                    </div>
                                </div>
                                <Toggle active={notifications.reports} onToggle={() => setNotifications({...notifications, reports: !notifications.reports})} />
                            </div>

                        </div>
                        <div className="p-4 border-t border-gray-800">
                             <button 
                                onClick={() => setAuthState('SIGNUP_SHOWCASE')} 
                                className="w-full bg-blue-600 py-4 text-black font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

            </SystemLayout>

            {/* Footer Status - Hide during intense modal moments */}
            {authState !== 'SIGNUP_CONFIRMATION' && authState !== 'SIGNUP_SHOWCASE' && (
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest animate-pulse">
                        Server Status: Online
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};
