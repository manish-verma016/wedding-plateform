import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, Clock, Search, Wand2, Star, Calendar, Save, Trash2, 
  Loader2, Download, MapPin, Moon, Sun, ChevronRight, ChevronLeft,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { generateAstroReading } from '../lib/astroService';

const MOODS = [
  { id: 'match', title: 'Celestial Matching', icon: Heart, description: 'Gun-Milan & Compatibility' },
  { id: 'muhurut', title: 'Muhurut Finder', icon: Clock, description: 'Auspicious Windows' },
];

const PANCHANG_DATA = {
  tithi: 'Shukla Paksha Shashthi',
  nakshatra: 'Pushya (Most Auspicious)',
  yoga: 'Siddha',
  karana: 'Kaulava',
  rahuKaal: '04:30 PM - 06:12 PM',
  gulika: '03:15 PM - 04:30 PM',
};

export default function AstroTools() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('match');
  const [wizardStep, setWizardStep] = useState(1); // 1: Groom, 2: Bride
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [matchData, setMatchData] = useState({
    groomName: '',
    groomDob: '',
    groomTime: '12:00',
    groomPlace: '',
    brideName: '',
    brideDob: '',
    brideTime: '12:00',
    bridePlace: '',
  });

  const [muhurutData, setMuhurutData] = useState({
    month: 'May 2026',
    eventType: 'Wedding',
  });

  const saveResult = async () => {
    if (!user || !result) {
      toast.error('Please sign in to save results');
      return;
    }
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'astro_results'), {
        userId: user.uid,
        type: result.type,
        data: result,
        names: activeTab === 'match' ? { 
          groom: matchData.groomName, 
          bride: matchData.brideName 
        } : null,
        createdAt: serverTimestamp(),
      });
      toast.success('Reading successfully archived in your vault!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save to cosmic vault');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateCompatibility = async () => {
    setIsCalculating(true);
    setResult(null);
    
    // Deterministic score based on names
    const combinedNames = (matchData.groomName + matchData.brideName).toLowerCase().replace(/\s/g, '');
    let charSum = 0;
    for (let i = 0; i < combinedNames.length; i++) charSum += combinedNames.charCodeAt(i);
    const score = 18 + (charSum % 19); // Result between 18 and 36
    
    let verdict = 'Graceful Union';
    if (score >= 32) verdict = 'Divine Alignment';
    else if (score >= 28) verdict = 'Highly Harmonious';
    else if (score >= 21) verdict = 'Stable Connection';
    else verdict = 'Challenging Orbit';

    const aiResult = await generateAstroReading('match', { ...matchData, score });

    setResult({
      type: 'match',
      score,
      verdict,
      metrics: [
        { label: 'Spiritual Sync', value: 70 + (charSum % 25) },
        { label: 'Karmic Weight', value: 50 + (charSum % 40) },
        { label: 'Financial Growth', value: 40 + (charSum % 50) },
        { label: 'Progeny Potency', value: 65 + (charSum % 30) },
      ],
      gunas: [
        { name: 'Varna', score: '1/1', desc: 'Working Ego Sync' },
        { name: 'Vashya', score: '2/2', desc: 'Dominance & Attraction' },
        { name: 'Tara', score: '1.5/3', desc: 'Longevity & Health' },
        { name: 'Yoni', score: '4/4', desc: 'Physical Chemistry' },
        { name: 'Maitri', score: '5/5', desc: 'Friendship & Intellect' },
        { name: 'Gana', score: '3/6', desc: 'Temperamental Tuning' },
        { name: 'Bhakut', score: '7/7', desc: 'Prosperity & Expansion' },
        { name: 'Nadi', score: '8/8', desc: 'Genetic/Progeny Health' },
      ],
      manglik: {
        groom: matchData.groomTime.includes('0') ? 'Strong Manglik' : 'No Dosha',
        bride: matchData.brideTime.includes('1') ? 'Anshik Manglik' : 'No Dosha',
        advice: aiResult?.manglikAdvice || 'Planetary remedies suggested for the second house transit.'
      },
      summary: aiResult?.summary || 'The birth charts reveal a promising alignment for long-term prosperity.',
      blessing: aiResult?.blessing || 'May the stars guide your journey.'
    });
    setIsCalculating(false);
    toast.success('Alignment Calculated!');
  };

  const handleMuhurutFind = (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setResult(null);

    setTimeout(() => {
      setIsCalculating(false);
      setResult({
        type: 'muhurut',
        dates: [
          { 
            date: '12th May 2026', 
            time: '10:30 AM - 01:45 PM', 
            tithi: 'Shukla Paksha Dashami',
            nakshatra: 'Pushya',
            yoga: 'Vridhi',
            rating: 5
          },
          { 
            date: '18th May 2026', 
            time: '06:15 PM - 09:30 PM', 
            tithi: 'Shukla Paksha Trayodashi',
            nakshatra: 'Rohini',
            yoga: 'Siddhi',
            rating: 4.8
          },
          { 
            date: '25th May 2026', 
            time: '08:45 AM - 12:00 PM', 
            tithi: 'Krishna Paksha Pratipada',
            nakshatra: 'Magha',
            yoga: 'Shubha',
            rating: 4.2
          },
        ],
        planetaryPositions: [
          { planet: 'Jupiter', status: 'Exalted in Cancer', effect: 'Blesses longevity and wisdom' },
          { planet: 'Venus', status: 'Kendra Sthana', effect: 'Enhances marital luxury and romance' },
          { planet: 'Mars', status: 'Retrograde', effect: 'Caution: Avoid arguments during the ritual' },
        ],
        detailedAdvice: [
          'The first date is highly recommended as it falls under Pushya, the King of Nakshatras.',
          'Mercury remains stable during these windows, ensuring effective communication during the vows.',
          'For maximum blessing, distribute yellow sweets to 7 scholars on the chosen date.'
        ]
      });
      toast.success('Divine Intervals Located!');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden pt-32 pb-20">
      {/* Background Celestial Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(76,29,149,0.15),transparent_40%)]" />
        
        {/* Animated Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: Math.random(), scale: Math.random() }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 3 + Math.random() * 5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Console */}
          <div className="lg:col-span-8 space-y-10">
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 mb-6"
              >
                <span className="px-3 py-1 bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-pink-500/20 backdrop-blur-md">
                  Vedic Oracle
                </span>
                <Moon className="w-4 h-4 text-pink-500 animate-pulse" />
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.8] mb-6">
                Astro <br /> <span className="text-pink-600 drop-shadow-[0_0_20px_rgba(219,39,119,0.3)]">Intelligence</span>
              </h1>
              <p className="max-w-xl text-gray-400 font-medium text-sm lg:text-base">
                Harnessing centuries of astral wisdom to ensure your union is perfectly synchronized with the cosmos. 
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white/5 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 w-fit">
              {MOODS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResult(null); setWizardStep(1); }}
                  className={cn(
                    "px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 transition-all",
                    activeTab === tab.id 
                      ? "bg-white text-gray-900 shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.title}</span>
                </button>
              ))}
            </div>

            {/* Interactive Workspace */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full translate-x-32 -translate-y-32 blur-[100px]" />
              
              <AnimatePresence mode="wait">
                {activeTab === 'match' ? (
                  <motion.div
                    key="match-wizard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-10"
                  >
                    {/* Wizard Progress */}
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex space-x-2">
                        {[1, 2].map((s) => (
                          <div 
                            key={s} 
                            className={cn(
                              "h-1.5 transition-all duration-500 rounded-full",
                              wizardStep === s ? "w-12 bg-pink-600 shadow-[0_0_10px_rgba(219,39,119,0.5)]" : "w-4 bg-white/10"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                        {wizardStep === 1 ? 'Step 01: Groom Profile' : 'Step 02: Bride Profile'}
                      </p>
                    </div>

                    {wizardStep === 1 ? (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                      >
                         <div className="grid md:grid-cols-2 gap-8">
                            <InputField 
                              label="Legal Name" 
                              placeholder="e.g. Rahul Sharma" 
                              value={matchData.groomName}
                              onChange={(val) => setMatchData({...matchData, groomName: val})}
                            />
                            <InputField 
                              label="Birth Date" 
                              type="date"
                              value={matchData.groomDob}
                              onChange={(val) => setMatchData({...matchData, groomDob: val})}
                            />
                            <InputField 
                              label="Birth Time" 
                              type="time"
                              value={matchData.groomTime}
                              onChange={(val) => setMatchData({...matchData, groomTime: val})}
                            />
                            <InputField 
                              label="Birth Location" 
                              placeholder="e.g. Delhi, India" 
                              Icon={MapPin}
                              value={matchData.groomPlace}
                              onChange={(val) => setMatchData({...matchData, groomPlace: val})}
                            />
                         </div>
                         <button 
                           onClick={() => setWizardStep(2)}
                           className="w-full h-20 bg-pink-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center group overflow-hidden relative"
                         >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                           Proceed to Bride Details <ChevronRight className="w-5 h-5 ml-3" />
                         </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                      >
                         <div className="grid md:grid-cols-2 gap-8">
                            <InputField 
                              label="Legal Name" 
                              placeholder="e.g. Anjali Verma" 
                              value={matchData.brideName}
                              onChange={(val) => setMatchData({...matchData, brideName: val})}
                            />
                            <InputField 
                              label="Birth Date" 
                              type="date"
                              value={matchData.brideDob}
                              onChange={(val) => setMatchData({...matchData, brideDob: val})}
                            />
                            <InputField 
                              label="Birth Time" 
                              type="time"
                              value={matchData.brideTime}
                              onChange={(val) => setMatchData({...matchData, brideTime: val})}
                            />
                            <InputField 
                              label="Birth Location" 
                              placeholder="e.g. Mumbai, India" 
                              Icon={MapPin}
                              value={matchData.bridePlace}
                              onChange={(val) => setMatchData({...matchData, bridePlace: val})}
                            />
                         </div>
                         <div className="flex gap-4">
                           <button 
                             onClick={() => setWizardStep(1)}
                             className="flex-1 h-20 bg-white/5 border border-white/10 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                           >
                             Back
                           </button>
                           <button 
                             onClick={calculateCompatibility}
                             disabled={isCalculating}
                             className="flex-[3] h-20 bg-white text-gray-900 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-[0.98] transition-all disabled:opacity-50"
                           >
                             {isCalculating ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Initiate Celestial Scan <Wand2 className="w-5 h-5 ml-3" /></>}
                           </button>
                         </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.form
                    key="muhurut-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleMuhurutFind}
                    className="space-y-10"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-4">Target Window</label>
                        <select
                          className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none transition-all font-bold text-sm text-white appearance-none focus:border-pink-500"
                          value={muhurutData.month}
                          onChange={(e) => setMuhurutData({ ...muhurutData, month: e.target.value })}
                        >
                          <option className="bg-[#020617]">Jan 2026</option>
                          <option className="bg-[#020617]">May 2026</option>
                          <option className="bg-[#020617]">Dec 2026</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-4">Ritual Category</label>
                        <select
                          className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none transition-all font-bold text-sm text-white appearance-none focus:border-pink-500"
                          value={muhurutData.eventType}
                          onChange={(e) => setMuhurutData({ ...muhurutData, eventType: e.target.value })}
                        >
                          <option className="bg-[#020617]">Wedding (Vivah)</option>
                          <option className="bg-[#020617]">Engagement (Sagai)</option>
                          <option className="bg-[#020617]">Home Entry (Griha Pravesh)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="w-full h-20 bg-pink-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-2xl hover:bg-pink-700 transition-all disabled:opacity-50"
                    >
                      {isCalculating ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Explore Divine Timings <Search className="w-5 h-5 ml-3" /></>}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Enhanced Results View */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-20 space-y-12 border-t border-white/5 pt-20"
                  >
                    {result.type === 'match' ? (
                      <motion.div 
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1
                            }
                          }
                        }}
                        initial="hidden"
                        animate="show"
                        className="space-y-12"
                      >
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, scale: 0.95 },
                            show: { opacity: 1, scale: 1 }
                          }}
                          className="bg-[#0f172a] border border-white/10 rounded-[4rem] p-16 text-center relative overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(219,39,119,0.1),transparent)]" />
                           <div className="absolute top-8 right-8">
                             <button 
                               onClick={saveResult}
                               disabled={isSaving}
                               className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center text-white hover:bg-pink-600 transition-all backdrop-blur-xl"
                             >
                               {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                             </button>
                           </div>

                           <div className="relative mb-12">
                              <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="w-40 h-40 rounded-full border-2 border-pink-500/30 mx-auto flex items-center justify-center bg-pink-500/10 shadow-[0_0_80px_rgba(219,39,119,0.2)]"
                              >
                                <div className="text-center">
                                  <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-5xl font-black text-white"
                                  >
                                    {result.score}
                                  </motion.p>
                                  <p className="text-[10px] font-black text-pink-500 uppercase">Gunas</p>
                                </div>
                              </motion.div>
                           </div>

                           <motion.h3 
                             variants={{
                               hidden: { opacity: 0, y: 10 },
                               show: { opacity: 1, y: 0 }
                             }}
                             className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4"
                           >
                             {result.verdict}
                           </motion.h3>
                           <motion.p 
                             variants={{
                               hidden: { opacity: 0 },
                               show: { opacity: 1 }
                             }}
                             className="text-gray-400 font-medium italic max-w-2xl mx-auto leading-relaxed border-t border-white/5 pt-6"
                           >
                             "{result.summary}"
                           </motion.p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                           {/* Metrics */}
                           <motion.div 
                             variants={{
                               hidden: { opacity: 0, x: -20 },
                               show: { opacity: 1, x: 0 }
                             }}
                             className="bg-white/5 rounded-[3rem] p-10 border border-white/10"
                           >
                              <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-10 flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-2" /> Alignment Breakdown
                              </h4>
                              <div className="space-y-6">
                                {result.metrics.map(m => (
                                  <div key={m.label}>
                                    <div className="flex justify-between items-end mb-2">
                                      <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{m.label}</span>
                                      <span className="text-[10px] font-black text-pink-500">{m.value}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${m.value}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-pink-600 rounded-full"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </motion.div>

                           {/* Dosha Status */}
                           <motion.div 
                             variants={{
                               hidden: { opacity: 0, x: 20 },
                               show: { opacity: 1, x: 0 }
                             }}
                             className="bg-pink-600/5 rounded-[3rem] p-10 border border-pink-600/20"
                           >
                              <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6 border-b border-pink-600/10 pb-4">
                                <AlertCircle className="w-4 h-4 mr-2 inline" /> Dosha Vulnerabilities
                              </h4>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Groom</span>
                                    <span className={cn("text-xs font-bold", result.manglik.groom.includes('No') ? 'text-green-500' : 'text-orange-500')}>{result.manglik.groom}</span>
                                 </div>
                                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Bride</span>
                                    <span className={cn("text-xs font-bold", result.manglik.bride.includes('No') ? 'text-green-500' : 'text-orange-500')}>{result.manglik.bride}</span>
                                 </div>
                                 <motion.div 
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 1 }}
                                   className="mt-6 p-4 bg-gray-900/50 rounded-2xl italic text-[11px] text-gray-400 border border-white/5 leading-relaxed"
                                 >
                                   "{result.manglik.advice}"
                                 </motion.div>
                              </div>
                           </motion.div>
                        </div>

                        {/* Gun Milan Table */}
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="bg-white/5 rounded-[4rem] p-12 border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-10">
                            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest italic">Ashtakuta Analysis Table</h4>
                            <button 
                              onClick={() => window.print()}
                              className="flex items-center text-[10px] font-black text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
                            >
                              <Download className="w-4 h-4 mr-2" /> PDF Report
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {result.gunas.map((g, idx) => (
                              <motion.div 
                                key={g.name} 
                                variants={{
                                  hidden: { opacity: 0, scale: 0.9 },
                                  show: { opacity: 1, scale: 1 }
                                }}
                                whileHover={{ scale: 1.05, borderColor: 'rgba(219,39,119,0.4)' }}
                                className="p-6 bg-white/5 rounded-3xl border border-white/5 transition-all"
                              >
                                <p className="text-[10px] font-black text-pink-400 uppercase mb-1">{g.name}</p>
                                <p className="text-xl font-black text-white italic">{g.score}</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase mt-2">{g.desc}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="space-y-12">
                        <div className="grid md:grid-cols-3 gap-8">
                          {result.dates.map((d, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ y: -10 }}
                              className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:border-pink-500/50 transition-all relative group"
                            >
                              <div className="absolute top-6 right-6 flex items-center space-x-1">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} className={cn("w-3 h-3", j < Math.floor(d.rating) ? 'text-pink-500 fill-pink-500' : 'text-white/10')} />
                                ))}
                              </div>
                              <h5 className="text-3xl font-black text-white italic tracking-tighter mb-4">{d.date}</h5>
                              <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">{d.time}</p>
                              <div className="space-y-2 border-t border-white/5 pt-6 opacity-60">
                                <p className="text-[9px] font-bold text-gray-400 flex justify-between uppercase"><span>Tithi</span> <span className="text-white">{d.tithi}</span></p>
                                <p className="text-[9px] font-bold text-gray-400 flex justify-between uppercase"><span>Nakshatra</span> <span className="text-white">{d.nakshatra}</span></p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-8">
                          <div className="bg-gray-900 border border-white/10 p-12 rounded-[3.5rem] relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                             <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-8">Planetary Oracle</h4>
                             <div className="space-y-6">
                               {result.planetaryPositions.map(p => (
                                 <div key={p.planet} className="flex justify-between items-start">
                                    <div>
                                      <p className="text-xs font-black text-white uppercase">{p.planet}</p>
                                      <p className="text-[9px] text-gray-500 font-bold italic">{p.effect}</p>
                                    </div>
                                    <span className="text-[9px] font-black px-3 py-1 bg-white/10 rounded-lg text-pink-400 uppercase tracking-widest">{p.status}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                          
                          <div className="bg-pink-600/5 p-12 rounded-[3.5rem] border border-pink-600/20">
                             <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-8">Acharya Wisdom</h4>
                             <div className="space-y-6">
                               {result.detailedAdvice.map((a, i) => (
                                 <div key={i} className="flex space-x-4">
                                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 shrink-0" />
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed italic">"{a}"</p>
                                 </div>
                               ))}
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 space-y-8 sticky top-32"
            >
               {/* Panchang Widget */}
               <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4 flex items-center">
                    <Sun className="w-4 h-4 mr-2 text-orange-500" /> Daily Panchang
                  </h3>
                  <div className="space-y-5">
                    <PanchangItem label="Tithi" value={PANCHANG_DATA.tithi} />
                    <PanchangItem label="Nakshatra" value={PANCHANG_DATA.nakshatra} highlight />
                    <PanchangItem label="Yoga" value={PANCHANG_DATA.yoga} />
                    <PanchangItem label="Rahu Kaal" value={PANCHANG_DATA.rahuKaal} danger />
                  </div>
               </div>

               {/* Celestial Event Notification */}
               <div className="bg-pink-600/10 p-6 rounded-3xl border border-pink-600/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="flex items-start space-x-4 relative">
                    <AlertCircle className="w-5 h-5 text-pink-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-pink-500 uppercase mb-2">Transit Alert</p>
                      <p className="text-[11px] text-gray-400 font-medium italic leading-relaxed">
                        "Mars entering Aries next week. Ideal for fixing engagement dates to ensure dynamic energy."
                      </p>
                    </div>
                  </div>
               </div>

               {/* Quick Links */}
               <div className="space-y-4 pt-6 border-t border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-2">Archived Alignments</p>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-pink-500/20 transition-all cursor-pointer group">
                    <div className="flex items-center space-x-3">
                       <Heart className="w-4 h-4 text-pink-500 opacity-50" />
                       <span className="text-[10px] font-bold text-gray-300 uppercase">Rahul & Anjali</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-pink-500" />
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, placeholder, type = "text", value, onChange, Icon }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-4">{label}</label>
      <div className="relative group">
        {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-pink-500 transition-colors" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 outline-none transition-all font-bold text-sm text-white focus:border-pink-600 focus:bg-white/10 transition-colors",
            Icon && "pl-14"
          )}
        />
      </div>
    </div>
  );
}

function PanchangItem({ label, value, highlight, danger }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={cn(
        "text-[10px] font-bold text-right leading-tight",
        highlight ? "text-pink-500" : danger ? "text-orange-500" : "text-gray-300"
      )}>
        {value}
      </span>
    </div>
  );
}
