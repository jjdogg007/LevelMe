
import React, { useState, useEffect, useRef } from 'react';
import { QuestTask, Exercise, PlayerStats } from '../types';
import { EXERCISE_INFO, SYSTEM_DATABASE } from '../constants';
import { playSystemSound, speakSystemMessage, startBattleMusic, stopBattleMusic } from '../services/audioService';
import { SystemVisualizer } from './SystemVisualizer';
import { VoiceCommandService } from '../services/voiceService';
import { HoldButton } from './HoldButton';

interface ActiveExerciseModalProps {
  task: QuestTask;
  stats: PlayerStats; // Added stats for damage calculation
  onUpdate: (newCurrent: number) => void;
  onClose: () => void;
  // Boss Props
  isDungeon?: boolean;
  bossName?: string;
}

export const ActiveExerciseModal: React.FC<ActiveExerciseModalProps> = ({ task, stats, onUpdate, onClose, isDungeon = false, bossName }) => {
  const [current, setCurrent] = useState(task.current);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false); // Music Toggle
  const voiceService = useRef<VoiceCommandService | null>(null);

  // Vision State
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [visionReady, setVisionReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const rafId = useRef<number | null>(null);
  const poseStateRef = useRef<'UP' | 'DOWN'>('UP');
  const poseBaselineRef = useRef<number | null>(null); // Baseline Y coordinate (Shoulder/Nose)

  // Juice States
  const [isShaking, setIsShaking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string, scale?: number}[]>([]);
  const [flashBoss, setFlashBoss] = useState(false);

  // Boss State
  const bossMaxHp = task.target * 10; 
  const [bossHp, setBossHp] = useState(Math.max(0, bossMaxHp - (task.current * 10)));
  const [playerHp, setPlayerHp] = useState(100);
  
  // Resolve exercise data
  const exerciseInfo: Exercise | undefined = task.exerciseId ? SYSTEM_DATABASE.find(e => e.id === task.exerciseId) : EXERCISE_INFO[task.name];
  const exerciseData = exerciseInfo || SYSTEM_DATABASE.find(e => e.name === task.name);
  const isWorkout = !!exerciseData;

  const setSize = Math.max(1, Math.ceil(task.target / 3));

  // Stat Multipliers
  const damageMultiplier = 1 + (stats.strength * 0.05); 
  // STAT SYNERGY: Vitality reduces rest time
  const restTimeTotal = Math.max(5, 60 - (stats.vitality * 0.8));

  // Init Voice
  useEffect(() => {
      voiceService.current = new VoiceCommandService((cmd) => {
          if (cmd.includes('next') || cmd.includes('log') || cmd.includes('set')) {
              addReps(setSize, true);
          } else if (cmd.includes('rest')) {
              setRestTimer(Math.floor(restTimeTotal));
          } else if (cmd.includes('done') || cmd.includes('finish') || cmd.includes('complete')) {
              handleFinish();
          } else if (cmd.includes('stop')) {
              onClose();
          }
      });

      return () => {
          if(voiceService.current) voiceService.current.stop();
          if(rafId.current) cancelAnimationFrame(rafId.current);
          stopBattleMusic(); // Ensure music stops on unmount
      };
  }, [setSize, restTimeTotal]);

  const toggleVoice = () => {
      if (isListening) {
          voiceService.current?.stop();
          setIsListening(false);
      } else {
          voiceService.current?.start();
          setIsListening(true);
      }
  };

  const toggleMusic = () => {
      if (musicEnabled) {
          stopBattleMusic();
          setMusicEnabled(false);
      } else {
          startBattleMusic();
          setMusicEnabled(true);
      }
  };

  // --- VISION SYSTEM START ---
  const startVisionSystem = async () => {
      if (visionEnabled) {
          // Turn off
          setVisionEnabled(false);
          setVisionReady(false);
          if (rafId.current) cancelAnimationFrame(rafId.current);
          if (videoRef.current && videoRef.current.srcObject) {
              const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
              tracks.forEach(track => track.stop());
          }
          return;
      }

      setVisionEnabled(true);
      
      try {
          // Initialize Camera
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'user', width: 640, height: 480 } 
          });
          
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                  videoRef.current?.play();
                  
                  // Initialize Model
                  initializePoseModel();
              };
          }
      } catch (err) {
          console.error("Vision Error:", err);
          alert("Optical Sensor Malfunction. Permission Denied or Hardware Unavailable.");
          setVisionEnabled(false);
      }
  };

  const initializePoseModel = async () => {
      if (!(window as any).poseDetection || !(window as any).tf) {
          alert("System modules (TensorFlow) not loaded.");
          setVisionEnabled(false);
          return;
      }

      try {
          await (window as any).tf.setBackend('webgl');
          const model = (window as any).poseDetection.SupportedModels.MoveNet;
          const detectorConfig = { modelType: (window as any).poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
          detectorRef.current = await (window as any).poseDetection.createDetector(model, detectorConfig);
          
          setVisionReady(true);
          detectPoseLoop();
      } catch (err) {
          console.error("Model Load Error", err);
          setVisionEnabled(false);
      }
  };

  const detectPoseLoop = async () => {
      if (!videoRef.current || !detectorRef.current || !canvasRef.current) return;

      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      if (poses && poses.length > 0) {
          const pose = poses[0];
          drawPose(pose);
          analyzePose(pose);
      }

      rafId.current = requestAnimationFrame(detectPoseLoop);
  };

  const drawPose = (pose: any) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !videoRef.current) return;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw Skeleton
      const keypoints = pose.keypoints;
      
      // Draw Points
      keypoints.forEach((kp: any) => {
          if (kp.score > 0.3) {
              ctx.beginPath();
              ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = '#00ff00'; // Matrix Green
              ctx.fill();
          }
      });

      // Draw Lines (Simple skeleton)
      const connections = [
          ['nose', 'left_eye'], ['nose', 'right_eye'],
          ['left_shoulder', 'right_shoulder'],
          ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
          ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
          ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
          ['left_hip', 'right_hip']
      ];

      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.lineWidth = 2;

      connections.forEach(([p1, p2]) => {
          const kp1 = keypoints.find((k: any) => k.name === p1);
          const kp2 = keypoints.find((k: any) => k.name === p2);
          if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
              ctx.beginPath();
              ctx.moveTo(kp1.x, kp1.y);
              ctx.lineTo(kp2.x, kp2.y);
              ctx.stroke();
          }
      });
  };

  const analyzePose = (pose: any) => {
      // Simplified "Vertical Cycle" Detection
      // Works for Squats, Pushups, Situps (mostly) by tracking head/shoulder vertical movement
      const nose = pose.keypoints.find((k: any) => k.name === 'nose');
      const leftShoulder = pose.keypoints.find((k: any) => k.name === 'left_shoulder');
      const rightShoulder = pose.keypoints.find((k: any) => k.name === 'right_shoulder');

      if (!nose || nose.score < 0.4) return; // Lost tracking

      // Average Y position of upper body
      let currentY = nose.y;
      if (leftShoulder && rightShoulder && leftShoulder.score > 0.4 && rightShoulder.score > 0.4) {
          currentY = (nose.y + leftShoulder.y + rightShoulder.y) / 3;
      }

      // Initialize Baseline (Standing/Top position)
      if (poseBaselineRef.current === null) {
          poseBaselineRef.current = currentY;
          return;
      }

      // Dynamic Baseline Drift (To adjust if user moves camera or changes position slightly)
      // Slowly pull baseline towards current Y if we are in UP state
      if (poseStateRef.current === 'UP') {
          poseBaselineRef.current = (poseBaselineRef.current * 0.95) + (currentY * 0.05);
      }

      // Thresholds (pixels) - Scale dependent, but assuming standard webcam distance
      const DOWN_THRESHOLD = 50; // Needs to go down at least this much pixels
      
      const diff = currentY - poseBaselineRef.current; // Positive = Down (Y increases downwards)

      if (poseStateRef.current === 'UP') {
          if (diff > DOWN_THRESHOLD) {
              poseStateRef.current = 'DOWN';
              // Visual Feedback
              const ctx = canvasRef.current?.getContext('2d');
              if (ctx) {
                  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                  ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
              }
          }
      } else if (poseStateRef.current === 'DOWN') {
          if (diff < (DOWN_THRESHOLD / 2)) {
              // Returned close to baseline
              poseStateRef.current = 'UP';
              addReps(1); // Count Rep
              playSystemSound('click');
          }
      }
  };
  // --- VISION SYSTEM END ---

  // Speech on Open
  useEffect(() => {
      if (isWorkout) {
          speakSystemMessage(isDungeon ? `Boss Battle. Enemy: ${bossName}. Use ${task.name} to deal damage.` : `Initiating ${task.name}.`);
      }
  }, []);

  useEffect(() => {
      let interval: any;
      if (restTimer !== null && restTimer > 0) {
          if (musicEnabled) stopBattleMusic(); // Pause music during rest
          interval = setInterval(() => {
              setRestTimer(prev => (prev && prev > 0 ? prev - 1 : 0));
          }, 1000);
      } else if (restTimer === 0) {
          playSystemSound('success');
          speakSystemMessage("Rest complete.");
          setRestTimer(null);
          if (musicEnabled) startBattleMusic(); // Resume music
          
          // Dungeon Mechanic: Taking too long damages player
          if (isDungeon) {
              playSystemSound('glitch');
              // VIT reduces damage taken
              const dmgTaken = Math.max(1, 10 - (stats.vitality * 0.1));
              setPlayerHp(prev => Math.max(0, prev - dmgTaken));
              triggerFloatingText(`-${Math.floor(dmgTaken)} HP`, 20, 80, 'text-red-500');
          }
      }
      return () => clearInterval(interval);
  }, [restTimer, isDungeon, stats.vitality, musicEnabled]);

  const triggerFloatingText = (text: string, x: number, y: number, color: string = 'text-white', scale: number = 1) => {
      const id = Date.now();
      setFloatingTexts(prev => [...prev, { id, text, x, y, color, scale }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 1000);
  };

  const triggerShake = (intensity: 'light' | 'heavy' = 'light') => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), intensity === 'heavy' ? 500 : 300);
  };

  const addReps = (amount: number, autoRest: boolean = false) => {
      const newValue = Math.min(current + amount, task.target * 2); // Allow over-completion slightly
      setCurrent(newValue);
      
      // Boss Logic
      if (isDungeon) {
          // Damage formula
          const rawDamage = amount * 10;
          const totalDamage = Math.floor(rawDamage * damageMultiplier);
          const isCrit = Math.random() < (stats.sense * 0.02); // Sense = Crit Chance
          const finalDamage = isCrit ? totalDamage * 2 : totalDamage;

          setBossHp(prev => Math.max(0, prev - finalDamage));
          setFlashBoss(true);
          setTimeout(() => setFlashBoss(false), 100);

          if (isCrit) {
              playSystemSound('levelUp');
              triggerShake('heavy');
              triggerFloatingText(
                  `CRITICAL! -${finalDamage}`, 
                  50 + (Math.random() * 10 - 5), 
                  40 + (Math.random() * 10 - 5), 
                  'text-yellow-400 font-black text-3xl',
                  1.5
              );
          } else {
              playSystemSound('click');
              triggerShake('light');
              triggerFloatingText(
                  `-${finalDamage}`, 
                  50 + (Math.random() * 20 - 10), 
                  40 + (Math.random() * 20 - 10), 
                  'text-red-500 font-bold text-2xl'
              );
          }

      } else {
          playSystemSound('click');
          triggerFloatingText(`+${amount}`, 50, 50, 'text-blue-400');
          triggerShake('light');
      }
      
      if (autoRest && isWorkout && newValue < task.target) {
          setRestTimer(Math.floor(restTimeTotal));
      }
  };

  const handleFinish = () => {
      stopBattleMusic();
      speakSystemMessage(`${task.name} Complete.`);
      onUpdate(current);
      onClose();
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min((current / task.target) * 100, 100);

  const getQuickAddButtons = () => {
      if (task.unit === 'mins') return [5, 10, 15];
      if (task.unit === 'hours') return [1, 2, 4];
      if (task.unit === 'km' || task.unit === 'miles') return [0.5, 1, 2];
      if (task.unit === 'liters') return [0.5, 1, 1.5];
      return [1, 5, 10];
  };
  const quickAdds = getQuickAddButtons();

  return (
    <div className={`fixed inset-0 z-[80] bg-black flex flex-col animate-in slide-in-from-bottom duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        
        {/* Floating Texts Overlay */}
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
            {floatingTexts.map(ft => (
                <div 
                    key={ft.id} 
                    className={`floating-text ${ft.color}`} 
                    style={{ left: `${ft.x}%`, top: `${ft.y}%`, transform: `scale(${ft.scale || 1})` }}
                >
                    {ft.text}
                </div>
            ))}
        </div>

        {/* --- HEADER --- */}
        <div className={`relative w-full bg-gray-900 border-b border-blue-900/50 ${isWorkout ? 'h-64' : 'h-32 flex items-center justify-center'}`}>
            
            {/* BOSS BAR OVERLAY */}
            {isDungeon && (
                <div className="absolute top-2 left-2 right-2 z-50">
                    <div className="flex justify-between text-xs font-bold uppercase text-red-500 mb-1">
                        <span>{bossName || "Unknown Entity"}</span>
                        <span>{Math.ceil(bossHp)}/{bossMaxHp}</span>
                    </div>
                    <div className="w-full h-4 bg-red-900/30 border border-red-900 rounded-sm overflow-hidden">
                        <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}></div>
                    </div>
                </div>
            )}

            {isWorkout ? (
                // WORKOUT HEADER
                <>
                    {/* Visualizer / Image / Camera */}
                    <div className={`w-full h-full relative overflow-hidden transition-opacity duration-100 ${flashBoss ? 'opacity-50 bg-red-500' : ''}`}>
                        
                        {visionEnabled ? (
                            <div className="w-full h-full bg-black relative">
                                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-50" playsInline muted autoPlay></video>
                                <canvas ref={canvasRef} width="640" height="480" className="absolute inset-0 w-full h-full object-cover"></canvas>
                                {!visionReady && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-blue-400 font-mono animate-pulse">INITIALIZING OPTICAL SENSORS...</p>
                                    </div>
                                )}
                                {/* HUD Overlay */}
                                <div className="absolute bottom-2 left-2 text-[10px] text-green-500 font-mono bg-black/50 px-2 rounded border border-green-500/50">
                                    <p>SYS.VIS: ONLINE</p>
                                    <p>TARGETING: SKELETAL_MESH</p>
                                </div>
                            </div>
                        ) : (
                            // Standard Visuals
                            exerciseData?.gifData ? (
                                <img src={`data:image/gif;base64,${exerciseData.gifData}`} className="w-full h-full object-cover opacity-60 grayscale brightness-125" />
                            ) : exerciseData?.videoUrl && !imgError ? (
                                <img src={exerciseData.videoUrl} onError={() => setImgError(true)} className="w-full h-full object-cover opacity-60 grayscale brightness-125" />
                            ) : (
                                <SystemVisualizer type={exerciseData?.type} active={!restTimer} />
                            )
                        )}
                        
                        {!visionEnabled && <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>}
                    </div>
                </>
            ) : (
                <div className="text-center z-10">
                    <h2 className="text-sm text-blue-400 font-bold uppercase tracking-widest mb-1">Recovery Protocol</h2>
                    <div className="h-0.5 w-10 bg-blue-500 mx-auto"></div>
                </div>
            )}

            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm border border-gray-600 z-50 hover:bg-red-900/50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className={`absolute left-4 right-4 flex justify-between items-end ${isWorkout ? 'bottom-4' : 'bottom-2'}`}>
                <div>
                    <h2 className={`font-bold text-white uppercase tracking-tighter system-text-shadow ${isWorkout ? 'text-3xl' : 'text-2xl'}`}>{task.name}</h2>
                    {isWorkout && (
                        <div className="flex space-x-2 text-[10px] mt-1">
                            <span className="text-blue-400 bg-blue-900/40 px-2 py-0.5 border border-blue-500/30 uppercase tracking-wider">
                                {exerciseData?.type || 'Strength'}
                            </span>
                            {/* Stat Bonus Indicators */}
                            {stats.strength > 20 && exerciseData?.type === 'Strength' && <span className="text-yellow-400 px-1 font-bold">STR BONUS ACTIVE</span>}
                            {stats.vitality > 30 && <span className="text-green-400 px-1 font-bold">RECOVERY+</span>}
                        </div>
                    )}
                </div>
                
                <div className="flex space-x-2">
                    {/* Vision Toggle */}
                    {isWorkout && (
                        <button 
                            onClick={startVisionSystem}
                            className={`p-3 rounded-full border ${visionEnabled ? 'bg-green-600 border-green-500 text-black' : 'bg-gray-800 border-gray-600 text-white'}`}
                            title="Activate System Vision"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}

                    {/* Music Toggle */}
                    <button 
                        onClick={toggleMusic}
                        className={`p-3 rounded-full border ${musicEnabled ? 'bg-purple-600 border-purple-500 animate-pulse' : 'bg-gray-800 border-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Voice Toggle */}
                    <button 
                        onClick={toggleVoice}
                        className={`p-3 rounded-full border ${isListening ? 'bg-red-600 border-red-500 animate-pulse' : 'bg-gray-800 border-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 flex flex-col p-6 bg-black relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none ${isWorkout ? (isDungeon ? 'bg-red-600/10' : 'bg-blue-600/5') : 'bg-green-600/5'}`}></div>

            <div className="flex-1 flex flex-col items-center justify-center mb-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="#1f2937" strokeWidth="12" fill="none" />
                        <circle 
                            cx="96" cy="96" r="88" 
                            stroke={current >= task.target ? (isWorkout ? "#22c55e" : "#10b981") : (isWorkout ? (isDungeon ? "#ef4444" : "#3b82f6") : "#6366f1")} 
                            strokeWidth="12" 
                            fill="none" 
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - progressPercent / 100)}
                            className="transition-all duration-500 ease-out"
                        />
                    </svg>
                    
                    <div className="absolute text-center">
                        <span className={`text-5xl font-bold font-mono tracking-tighter ${current >= task.target ? 'text-green-500' : 'text-white'}`}>
                            {current}
                        </span>
                        <div className="h-0.5 w-12 bg-gray-700 mx-auto my-1"></div>
                        <span className="text-gray-500 text-xl font-mono">{task.target}</span>
                        <p className="text-[10px] text-gray-600 uppercase mt-1 tracking-widest">{task.unit}</p>
                    </div>
                </div>

                {/* Player HP Bar for Dungeon */}
                {isDungeon && (
                    <div className="w-48 mt-4">
                        <div className="flex justify-between text-[10px] text-blue-400 mb-1">
                            <span>PLAYER HP</span>
                            <span>{playerHp}%</span>
                        </div>
                         <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${playerHp}%` }}></div>
                         </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 relative z-10">
                <div className="grid grid-cols-3 gap-3">
                    {quickAdds.map((amt) => (
                        <button 
                            key={amt}
                            onClick={() => addReps(amt)}
                            className="py-3 border border-gray-700 bg-gray-900/50 text-gray-300 font-bold hover:bg-gray-800 hover:border-gray-500 hover:text-white transition-all rounded-sm"
                        >
                            +{amt}
                        </button>
                    ))}
                </div>

                {isWorkout ? (
                    <>
                        {/* HOLD BUTTON - Interaction Friction */}
                        <HoldButton 
                            onComplete={() => addReps(setSize, true)}
                            label={
                                <div className="flex items-center space-x-2">
                                    <span className="uppercase tracking-[0.2em] font-bold">{isDungeon ? 'ATTACK' : 'LOG SET'}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${isDungeon ? 'bg-red-900/50 border-red-500/30' : 'bg-black/20 border-white/20'}`}>
                                        +{setSize}
                                    </span>
                                </div>
                            }
                            colorClass={isDungeon ? 'bg-red-600' : 'bg-blue-600'}
                            className={`w-full py-4 border ${isDungeon ? 'border-red-500 text-white' : 'border-blue-500 text-white'}`}
                        />

                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setCurrent(0)}
                                className="flex-1 py-3 border border-red-900/30 text-red-900 hover:text-red-500 hover:border-red-500 text-xs uppercase tracking-wider transition-all"
                            >
                                Reset
                            </button>
                            
                            {restTimer ? (
                                <button 
                                    onClick={() => setRestTimer(null)}
                                    className="flex-[2] bg-gray-800 border border-blue-500/50 text-blue-400 font-mono font-bold animate-pulse"
                                >
                                    RESTING {formatTime(restTimer)}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setRestTimer(Math.floor(restTimeTotal))}
                                    className="flex-[2] border border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 text-xs uppercase tracking-wider transition-all"
                                >
                                    Rest ({Math.floor(restTimeTotal)}s)
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex space-x-3 mt-4">
                         <button 
                            onClick={() => setCurrent(0)}
                            className="flex-1 py-3 border border-red-900/30 text-red-900 hover:text-red-500 hover:border-red-500 text-xs uppercase tracking-wider transition-all"
                        >
                            Reset
                        </button>
                         <button 
                            onClick={() => setCurrent(task.target)}
                            className="flex-[2] py-3 bg-gray-900 border border-green-500/30 text-green-400 font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all"
                        >
                            Mark Complete
                        </button>
                    </div>
                )}
            </div>
        </div>

        <button 
            onClick={handleFinish}
            className={`${isWorkout ? (isDungeon ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500') : 'bg-green-600 hover:bg-green-500'} text-black font-bold py-5 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all z-50`}
        >
            Confirm Progress
        </button>

    </div>
  );
};
