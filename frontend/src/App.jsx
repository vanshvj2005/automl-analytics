  import { motion } from "framer-motion";
  import useAutoML from "./hooks/useAutoMl";
  import { 
    ChevronRight, 
    User,
    UploadCloud,
    Target,
    PlayCircle,
    FileDown,
    Eraser as EraserIcon, 
    Network as NetworkIcon, 
    EyeOff as EyeOffIcon, 
    FileText as FileTextIcon, 
    Cpu as CpuIcon, 
    LineChart as LineChartIcon,
    Brain as BrainIcon,
    History as HistoryIcon
  } from "lucide-react";

  import { useState } from "react";

  const Navigation = ({ onStart, onHome, showHome }) => {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#faf9f8]/80 backdrop-blur-md border-b border-[#EAE6DF]">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-10 py-4">
          <div 
            onClick={onHome}
            className="text-2xl tracking-tighter text-[#1a1c1c] font-display font-medium cursor-pointer"
          >
            AutoML
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={showHome ? onHome : onStart}
              className="px-6 py-2 bg-[#EA580C] text-white font-mono text-[10px] tracking-widest uppercase rounded-sm transition-all hover:shadow-lg hover:shadow-[#EA580C]/20 active:scale-95 font-medium"
            >
              {showHome ? "Back to Home" : "Launch Engine"}
            </button>
            <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center cursor-pointer hover:bg-[#f4f3f2] transition-colors">
              <User className="text-[#736E67] w-5 h-5" />
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const Hero = ({ onStart }) => {
    return (
      <section className="min-h-[85vh] flex flex-col justify-center items-center border-b border-[#EAE6DF] relative overflow-hidden hero-pattern">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EA580C] rounded-full blur-[100px] pointer-events-none"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.08, 0.05],
            x: [0, -20, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EA580C] rounded-full blur-[100px] pointer-events-none"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-10 w-full text-center relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            className="flex flex-col items-center max-w-5xl mx-auto py-16"
          >
            <motion.span 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 0.8, y: 0 } }}
              className="font-mono text-xs text-[#EA580C] tracking-[4px] uppercase mb-8"
            >
              Intelligent Analytics Engine
            </motion.span>
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl text-[#1a1c1c] leading-[1.05] tracking-tight font-medium"
            >
              Replace manual workflows with <br/>
              <span className="text-[#EA580C] font-serif italic font-normal">intelligent analytics</span>. <br/>
              Discover <span className="text-[#EA580C]">AutoML</span>.
            </motion.h1>
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8 }}
              className="text-lg text-[#736E67] mt-10 max-w-2xl font-medium leading-relaxed"
            >
              A production-ready analytics engine built for researchers and analysts who value depth over complex dashboards. Experience the next evolution of automated machine learning with tactile precision.
            </motion.p>
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
            >
              <button 
                onClick={onStart}
                className="px-10 py-4 bg-[#EA580C] text-white  rounded-sm font-mono text-xs tracking-widest uppercase transition-all hover:brightness-110 hover:shadow-xl hover:shadow-[#EA580C]/20 active:scale-95 min-w-[220px]"
              >
                START TRAINING
              </button>
              <button className="px-10 py-4 bg-[#f4f3f2] border  rounded-sm  border-[#EAE6DF] text-[#1a1c1c] font-mono text-xs tracking-widest uppercase transition-all hover:bg-[#eeeeed] active:scale-95 min-w-[220px]">
                EXPLORE DOCUMENTATION
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  };

  const FrictionPoint = () => {
    return (
      <section className="py-16 border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-1"></div>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-5"
          >
            <h2 className="text-3xl text-[#1a1c1c] font-medium">The friction point.</h2>
            <p className="text-base text-[#736E67] mt-4 leading-relaxed font-medium">
              Modern machine learning is often rigid and cold. Researchers don't need more black-box dashboards; they need welcoming, intuitive spaces structured with <span className="text-[#EA580C] italic">tactile precision</span>.
            </p>
            <motion.ul 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="mt-12 space-y-4"
            >
              {[
                { icon: <EraserIcon />, text: "Manual data cleaning and prep bottlenecks." },
                { icon: <NetworkIcon />, text: "Overwhelming model selection paradoxes." },
                { icon: <EyeOffIcon />, text: "Black box predictions lacking explainability." },
                { icon: <FileTextIcon />, text: "Fragmented, non-deterministic reporting." }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="flex items-center gap-4"
                >
                  <div className="text-[#EA580C] w-5 h-5">{item.icon}</div>
                  <span className="text-[#1a1c1c]">{item.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-6 border-l border-[#EAE6DF] pl-12 flex items-center"
          >
            <blockquote className="text-3xl italic text-[#5a4138] leading-relaxed font-light">
              "The difference between a tool and an experience is warmth. Without it, you simply process data instead of guiding research."
            </blockquote>
          </motion.div>
        </div>
      </section>
    );
  };

  const Pillar = ({ num, title, desc, phase, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="gradient-border-shell group hover:-translate-y-2 transition-transform duration-500 h-full"
    >
      <div className="glass-card h-full p-8 flex flex-col border border-white/50">
        <span className="font-mono text-xs text-[#EA580C] mb-4 block">{num}</span>
        <h3 className="text-2xl leading-tight text-[#1a1c1c] mb-4 font-medium" dangerouslySetInnerHTML={{ __html: title.replace('\n', '<br/>') }}></h3>
        <p className="text-sm text-[#494644] mb-8 leading-relaxed font-medium">{desc}</p>
        <div className="mt-auto">
          <span className="font-mono text-[10px] text-[#EA580C]/40 uppercase tracking-widest block">{phase}</span>
        </div>
      </div>
    </motion.div>
  );

  const Intelligence = () => {
    const pillars = [
      { num: "01", title: "Automated\nCleaning", desc: "Preprocessing manages outliers with tactile precision at the intake layer.", phase: "Intake Phase", delay: 0.1, offset: false },
      { num: "02", title: "Meta\nLearning", desc: "Deterministic paths through statistical flows, mapping high-dimensional spaces.", phase: "Structural Logic", delay: 0.2, offset: true },
      { num: "03", title: "Optuna\nTuning", desc: "Gentle feedback loops for hyperparameter optimization and tuning.", phase: "Optimization", delay: 0.3, offset: false },
      { num: "04", title: "XAI\nIntegration", desc: "Transparent interpretation layers that eliminate black-box uncertainty.", phase: "Transparency", delay: 0.4, offset: true },
      { num: "05", title: "Meaningful\nReports", desc: "Milestone discovery celebrations through subtle, elegant visual narratives.", phase: "Synthesis", delay: 0.5, offset: false },
    ];

    return (
      <section className="py-24 pb-48 border-b border-[#EAE6DF] bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col mb-16"
          >
            <h2 className="text-5xl text-[#1a1c1c] font-medium mb-2">Integrated Intelligence.</h2>
            <p className="text-base text-[#736E67] max-w-2xl font-medium">A seamless loop from raw intake to discovery, powered by five core architectural pillars.</p>
          </motion.div>
          <div className="relative">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="hidden lg:block absolute top-[40%] left-0 w-full h-px bg-gradient-to-r from-[#EA580C]/30 via-[#EA580C]/10 to-transparent z-0 origin-left"
            ></motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10"
            >
              {pillars.map((p, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col ${p.offset ? 'lg:mt-24' : ''}`}
                >
                  <Pillar {...p} delay={0} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const ExperienceFlow = () => {
    const models = [
      { name: "ResNet-101 (Optimized)", acc: "98.4", lat: "12ms", status: "STABLE", icon: <CpuIcon className="text-[#EA580C] w-5 h-5" /> },
      { name: "Auto-XGBoost Ensemble", acc: "97.2", lat: "45ms", status: "TRAINING", icon: <LineChartIcon className="text-[#EA580C] w-5 h-5" /> },
      { name: "Transformer V3-Light", acc: "96.8", lat: "8ms", status: "DEPLOYED", icon: <BrainIcon className="text-[#EA580C] w-5 h-5" /> },
    ];

    return (
      <section className="py-24 bg-[#faf9f8]">
        <div className="max-w-7xl mx-auto px-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl text-[#1a1c1c] font-medium">Experience the flow.</h2>
            <p className="text-base text-[#736E67] mt-2 font-medium">Interact with the core model leaderboard in our live research environment.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="gradient-border-shell overflow-hidden shadow-2xl"
          >
            <div className="glass-card p-12 border border-white/50">
              <div className="flex items-center justify-between mb-12">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 opacity-40"></div>
                  <div className="w-3 h-3 rounded-full bg-orange-400 opacity-40"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-400 opacity-40"></div>
                </div>
                <span className="font-mono text-[10px] text-[#736E67] uppercase tracking-widest opacity-60">Model Leaderboard // Live Cluster 01-A</span>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-12 border-b border-[#EAE6DF]/40 pb-2 font-mono text-[10px] text-[#736E67] uppercase tracking-wider">
                  <div className="col-span-12 md:col-span-5">Model Architecture</div>
                  <div className="col-span-4 md:col-span-2">Accuracy</div>
                  <div className="col-span-4 md:col-span-2">Latency</div>
                  <div className="col-span-4 md:col-span-3 text-right">Status</div>
                </div>
                
                {models.map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    viewport={{ once: true }}
                    className="grid grid-cols-12 items-center py-6 border-b border-[#EAE6DF]/20 hover:bg-[#f4f3f2] transition-colors px-4 -mx-4 rounded-lg group"
                  >
                    <div className="col-span-12 md:col-span-5 flex items-center gap-4 mb-4 md:mb-0">
                      {m.icon}
                      <span className="font-mono text-sm text-[#1a1c1c]">{m.name}</span>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-2xl md:text-3xl font-light text-[#1a1c1c] group-first:text-[#EA580C]">
                      {m.acc}<span className="text-xs">%</span>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-base text-[#736E67]">{m.lat}</div>
                    <div className="col-span-4 md:col-span-3 text-right">
                      <span className={`px-3 py-1 rounded-sm text-[10px] font-mono tracking-widest ${
                        m.status === 'STABLE' ? 'bg-green-100 text-green-800' :
                        m.status === 'TRAINING' ? 'bg-[#eeeeed] text-[#736E67]' :
                        'bg-[#ffdbce] text-[#7f2b00]'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  const Innovation = () => {
    return (
      <section className="py-0 border-t border-[#EAE6DF] bg-[#1a1c1c] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2">
          <div className="py-24 lg:py-0 min-h-[500px] lg:min-h-[800px] relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.2 }}
              transition={{ duration: 2 }}
              viewport={{ once: true }}
              className="absolute inset-0 pointer-events-none"
            >
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path className="text-[#EA580C]" d="M0 0 L100 100 M0 100 L100 0" fill="none" stroke="currentColor" strokeWidth="0.1"></path>
                <circle className="text-white" cx="50" cy="50" fill="none" r="30" stroke="currentColor" strokeWidth="0.1"></circle>
                <rect className="text-white/40" fill="none" height="50" stroke="currentColor" strokeWidth="0.1" width="50" x="25" y="25"></rect>
              </svg>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative z-10 text-center space-y-6"
            >
              <span className="font-mono text-xs text-[#EA580C] tracking-[4px] uppercase mb-4 block">System Architecture</span>
              <h2 className="text-5xl md:text-6xl leading-tight font-medium">Self-Improving<br/><span className="italic text-[#EA580C]">Knowledge Base</span></h2>
              <div className="mt-12 p-6 border border-white/20 rounded-[23px] inline-flex items-center gap-12 bg-white/10 backdrop-blur-md">
                <div className="text-left">
                  <span className="font-mono text-[10px] block opacity-60 mb-1">EFFICIENCY RATE</span>
                  <span className="text-2xl font-bold">+42%</span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-left">
                  <span className="font-mono text-[10px] block opacity-60 mb-1">ADAPTATION LAG</span>
                  <span className="text-2xl font-bold">0.4ms</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="py-24 lg:py-0 lg:pl-16 flex flex-col justify-center space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-md"
            >
              <span className="font-mono text-xs text-[#EA580C] mb-4 block uppercase tracking-widest">Core Innovation</span>
              <h3 className="text-4xl text-white mb-6 font-medium">RAG-Inspired Memory</h3>
              <p className="text-base text-white/60 leading-relaxed font-medium">
                Our engine doesn't just process data; it learns from its own correction patterns. Context-aware retrieval for model metadata allows you to access past hyperparameter trajectories and experiment logs via a natural language interface that understands the semantics of your research goals.
              </p>
              <div className="mt-12 space-y-6">
                {[
                  { icon: <BrainIcon />, title: "Cognitive Retention", desc: "Learns correction patterns and adapts suggested features over time." },
                  { icon: <HistoryIcon />, title: "Semantic Retrieval", desc: "Natural language interface for deep historical experiment logs." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-start p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#EA580C]/50 transition-colors group"
                  >
                    <div className="text-[#EA580C] w-6 h-6 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-mono font-bold text-white uppercase text-[11px] tracking-wider">{item.title}</h4>
                      <p className="text-[13px] text-white/40 mt-1 font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const CTA = ({ onStart }) => {
    return (
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Decorative Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EA580C]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-10 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <span className="font-mono text-[10px] text-[#EA580C] tracking-[6px] uppercase mb-6 font-medium">Final Discovery</span>
            <h2 className="text-4xl md:text-6xl mb-6 text-[#1a1c1c] font-display font-medium tracking-tight">
              Ready to redefine your <span className="text-[#EA580C] font-serif italic font-normal">research?</span>
            </h2>
            <p className="text-lg text-[#736E67] mb-8 max-w-xl font-medium leading-relaxed">
              Join the elite research teams already using AutoML Lumina to automate their most complex statistical workflows.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-md">
              <button 
                onClick={onStart}
                className="flex-1 px-8 py-5 bg-[#1a1c1c] text-white font-display text-sm tracking-wide font-semibold rounded-xl transition-all hover:bg-[#EA580C] hover:shadow-2xl hover:shadow-[#EA580C]/30 active:scale-[0.98] group"
              >
                Get Started Now
                <ChevronRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="flex-1 px-8 py-5 border border-[#EAE6DF] text-[#1a1c1c] font-display text-sm tracking-wide font-semibold rounded-xl transition-all hover:bg-[#faf9f8] active:scale-[0.98]">
                Book a Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  const Footer = () => {
    return (
      <footer className="bg-[#faf9f8] border-t border-[#EAE6DF] relative z-10">
        <div className="max-w-7xl mx-auto px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-2xl text-[#1a1c1c] font-display font-medium">AutoML</div>
            <p className="text-sm text-[#736E67] font-medium">Technical Warmth Defined. A new standard for analytic engine interfaces.</p>
          </div>
          
          <div className="flex items-center gap-8">
            <p className="font-mono text-[10px] text-[#736E67] opacity-60 uppercase tracking-widest">© 2024 AutoML Intelligent Engine</p>
           
          </div>
        </div>
      </footer>
    );
  };

  const AppInterface = ({
    fileName,
    setSelectedFile,
    target,
    setTarget,
    runPipeline,
    isProcessing,
    globalStatus,
    errorMessage,
    failedStage,
    setGlobalStatus,
    logs,
    activeTab,
    setActiveTab,
    metrics,
    pdfLink,
    leaderboard,
    edaPlots,
    evaluationPlots,
  }) => {

    return (
      <div className="min-h-[calc(100vh-144px)] bg-[#faf9f8] flex flex-col relative overflow-hidden">
        {/* Decorative Hero Pattern for the App View */}
        <div className="fixed inset-0 hero-pattern opacity-40 pointer-events-none"></div>

        <div className="flex flex-1 overflow-hidden relative z-10 max-w-7xl mx-auto w-full px-10 py-12 gap-10">
          
          {/* Sidebar - Pipeline Controls */}
          <div className="w-full md:w-[380px] shrink-0 flex flex-col gap-6">
            <div className="gradient-border-shell h-fit">
              <div className="glass-card p-8 border border-white/50">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-6 h-px bg-[#EA580C]"></div>
                  <h2 className="font-mono text-[10px] text-[#EA580C] uppercase tracking-widest font-bold">Pipeline Setup</h2>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <label className="block font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-3 font-bold">01. Source Intake</label>
                    <div className="relative border border-[#EAE6DF] hover:border-[#EA580C] bg-white rounded-sm p-6 text-center transition-all cursor-pointer group-hover:shadow-lg group-hover:shadow-[#EA580C]/5">
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                      <UploadCloud className="w-6 h-6 text-[#EA580C] mx-auto mb-2 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                      <p className="text-xs text-[#1a1c1c] font-mono truncate px-2">{fileName}</p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-3 font-bold">02. Inference Target</label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EA580C] w-4 h-4 opacity-40" />
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="Variable (e.g., target_pred)"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#EAE6DF] focus:border-[#EA580C] outline-none transition-all font-mono text-xs rounded-sm"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={runPipeline} 
                    disabled={isProcessing} 
                    className="w-full bg-[#1a1c1c] text-white py-4 font-mono text-xs tracking-[2px] uppercase transition-all hover:bg-[#EA580C] disabled:opacity-50 disabled:bg-[#1a1c1c] active:scale-[0.98] flex justify-center items-center gap-3 group"
                  >
                    <PlayCircle className={`w-4 h-4 ${isProcessing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} /> 
                    {isProcessing ? 'Executing...' : 'Launch Cycle'}
                  </button>
                </div>

                {/* Execution Status Steps */}
                <div className="mt-12 space-y-6 pt-12 border-t border-[#EAE6DF]">
                  {[
                    { title: 'Preprocessing', desc: 'Auto-cleaning & outliers' },
                    { title: 'Feature Mapping', desc: 'Deep-spatial analysis' },
                    { title: 'Gradient Descent', desc: 'Recursive optimization' },
                    { title: 'Evaluation Plot', desc: 'Final metric synthesis' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full border border-[#EAE6DF] ${isProcessing && idx < logs.length-1 ? 'bg-[#EA580C] border-[#EA580C]' : 'bg-transparent'} transition-all duration-700`}></div>
                        {idx < 3 && <div className="w-px h-8 bg-[#EAE6DF] mt-1"></div>}
                      </div>
                      <div className="flex-1">
                        <p className={`font-display text-xs font-bold leading-none ${isProcessing && idx < logs.length-1 ? 'text-[#1a1c1c]' : 'text-[#736E67] opacity-60'}`}>{step.title}</p>
                        <p className="font-mono text-[9px] text-[#736E67] mt-1 uppercase tracking-widest">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log Window */}
            <div className="bg-[#1a1c1c] p-6 rounded-sm border border-white/5 font-mono text-[10px] shadow-2xl relative overflow-hidden h-40">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <div className="text-[#EA580C] mb-3 uppercase tracking-widest font-bold opacity-60">System Log // Live Feed</div>
              <div className="space-y-1 overflow-y-auto max-h-24 scrollbar-hide">
                {logs.map((log, i) => (
                  <div key={i} className="text-white/60 flex gap-2">
                    <span className="text-[#EA580C] opacity-40">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
  {/* Tab Navigation */}
  <div className="flex gap-10 items-center border-b border-[#EAE6DF] shrink-0">
    {["eda", "metrics", "charts"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`pb-4 text-xs font-mono uppercase tracking-[2px] transition-all relative ${
          activeTab === tab
            ? "text-[#EA580C] font-bold"
            : "text-[#736E67] hover:text-[#1a1c1c]"
        }`}
      >
        {tab === "eda"
          ? "Insights"
          : tab === "metrics"
          ? "Leaderboard"
          : "Evaluation"}

        {activeTab === tab && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C]"
          />
        )}
      </button>
    ))}
  </div>

  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide py-4">
    {/* Loading State */}
    {isProcessing ? (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 mb-6 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-[#EA580C] rounded-full"
          />
          <div className="absolute inset-2 border-r-2 border-[#1a1c1c]/20 rounded-full" />
          <BrainIcon className="absolute inset-0 m-auto w-8 h-8 text-[#EA580C] animate-pulse" />
        </div>
        <h3 className="text-2xl font-display font-medium text-[#1a1c1c]">
          Processing Latent Spaces...
        </h3>
        <p className="text-[#736E67] font-mono text-[10px] uppercase tracking-widest mt-2">
          {logs[logs.length - 1]}
        </p>
      </div>
    ) : globalStatus === "FAILED" ? (
      /* Failure State */
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="glass-card p-10 border border-red-200 max-w-xl shadow-2xl">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <EraserIcon className="w-8 h-8 text-red-600 opacity-90" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 font-bold block mb-2">
            Pipeline Alert // {failedStage || "Execution Error"}
          </span>
          <h3 className="text-2xl font-display text-[#1a1c1c] font-bold mb-3">
            {failedStage ? `${failedStage} Failed` : "Pipeline Execution Failed"}
          </h3>
          <div className="text-[#494644] font-mono text-xs leading-relaxed mb-6 bg-red-50/80 p-4 rounded-md border border-red-200 text-left break-words">
            {errorMessage || logs[logs.length - 1] || "The pipeline encountered an error during execution."}
          </div>
          <button
            onClick={() => {
              if (setGlobalStatus) setGlobalStatus("IDLE");
            }}
            className="px-8 py-3 bg-[#1a1c1c] text-white font-mono text-xs tracking-widest uppercase hover:bg-[#EA580C] transition-all rounded-sm shadow-md active:scale-95"
          >
            Acknowledge & Try Again
          </button>
        </div>
      </div>
    ) : logs.length <= 1 ? (
      /* Empty State */
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="glass-card p-12 border border-white max-w-md">
          <div className="w-16 h-16 bg-[#faf9f8] border border-[#EAE6DF] rounded-full flex items-center justify-center mx-auto mb-6">
            <CpuIcon className="w-6 h-6 text-[#736E67] opacity-40" />
          </div>
          <h3 className="text-xl font-display text-[#1a1c1c] font-medium mb-2">
            Idle Engine
          </h3>
          <p className="text-[#736E67] font-sans font-medium text-sm">
            Upload your research data to begin high-precision inference cycles.
          </p>
        </div>
      </div>
    ) : (
      /* Results */
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* ===================== EDA TAB ===================== */}
        {activeTab === "eda" && (
          <div>
            {edaPlots && edaPlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {edaPlots.map((plot, index) => (
                  <div key={index} className="gradient-border-shell">
                    <div className="glass-card border border-white/50 p-4">
                      <img
                        src={plot}
                        alt={`EDA Plot ${index + 1}`}
                        className="w-full rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "block";
                          }
                        }}
                      />
                      <div style={{ display: "none" }} className="p-4 text-center font-mono text-xs text-[#736E67]">
                        Unable to load image at {plot}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gradient-border-shell">
                <div className="glass-card h-64 border border-white/50 flex items-center justify-center text-center p-8">
                  <div>
                    <LineChartIcon className="w-10 h-10 text-[#EA580C] mx-auto mb-4 opacity-50" />
                    <h4 className="font-display font-bold text-[#1a1c1c] mb-2">
                      No EDA Plots Available
                    </h4>
                    <p className="text-[#736E67] text-sm">
                      EDA completed successfully, but no numeric distribution plots or correlation heatmaps were generated for this dataset.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== METRICS TAB ===================== */}
        {activeTab === "metrics" && (
          <div className="space-y-12">
            {/* Metric Cards - Held-Out Test Evaluation */}
            {metrics?.problemType === "classification" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#EAE6DF] p-8 text-center rounded-sm">
                  <p className="font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-2">
                    Held-Out Test Accuracy
                  </p>
                  <p className="text-4xl font-display font-bold text-[#EA580C]">
                    {metrics?.accuracy != null
                      ? Number(metrics.accuracy).toFixed(4)
                      : "--"}
                  </p>
                  <p className="font-mono text-[9px] text-[#736E67] mt-2">
                    Evaluated on 20% holdout split
                  </p>
                </div>

                <div className="bg-white border border-[#EAE6DF] p-8 text-center rounded-sm">
                  <p className="font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-2">
                    Champion CV Accuracy
                  </p>
                  <p className="text-4xl font-display font-bold text-[#1a1c1c]">
                    {leaderboard && leaderboard.length > 0 && leaderboard[0].cv_score != null
                      ? Number(leaderboard[0].cv_score).toFixed(4)
                      : "--"}
                  </p>
                  <p className="font-mono text-[9px] text-[#736E67] mt-2">
                    Mean out-of-fold validation score
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#EAE6DF] p-8 text-center rounded-sm">
                  <p className="font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-2">
                    Held-Out Test R² Score
                  </p>
                  <p className="text-4xl font-display font-bold text-[#EA580C]">
                    {metrics?.r2 != null
                      ? Number(metrics.r2).toFixed(4)
                      : "--"}
                  </p>
                  <p className="font-mono text-[9px] text-[#736E67] mt-2">
                    Evaluated on 20% holdout split
                  </p>
                </div>

                <div className="bg-white border border-[#EAE6DF] p-8 text-center rounded-sm">
                  <p className="font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-2">
                    Held-Out Test RMSE
                  </p>
                  <p className="text-4xl font-display font-bold text-[#1a1c1c]">
                    {metrics?.rmse != null
                      ? Number(metrics.rmse).toFixed(4)
                      : "--"}
                  </p>
                  <p className="font-mono text-[9px] text-[#736E67] mt-2">
                    Root Mean Squared Error
                  </p>
                </div>

                <div className="bg-white border border-[#EAE6DF] p-8 text-center rounded-sm">
                  <p className="font-mono text-[10px] text-[#736E67] uppercase tracking-widest mb-2">
                    Held-Out Test MAE
                  </p>
                  <p className="text-4xl font-display font-bold text-[#1a1c1c]">
                    {metrics?.mae != null
                      ? Number(metrics.mae).toFixed(4)
                      : "--"}
                  </p>
                  <p className="font-mono text-[9px] text-[#736E67] mt-2">
                    Mean Absolute Error
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard && leaderboard.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-display font-medium text-[#1a1c1c]">
                    Model Leaderboard (Cross-Validation: {metrics?.problemType === "classification" ? "Accuracy" : "R²"})
                  </h3>
                  <p className="text-xs text-[#736E67] mt-1">
                    Candidate models ranked strictly by cross-validation performance on training folds. The champion is selected based on highest mean CV score.
                  </p>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((model, index) => {
                    const score =
                      model.cv_score ??
                      model.best_score ??
                      model.test_score;

                    return (
                      <div
                        key={index}
                        className={`bg-white border p-4 rounded-sm flex justify-between items-center ${
                          index === 0
                            ? "border-[#EA580C]/40 bg-orange-50/20"
                            : "border-[#EAE6DF]"
                        }`}
                      >
                        {/* Model Name & Champion Tag */}
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[#736E67] w-6">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-[#1a1c1c]">
                            {model.model}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-[#EA580C] text-white text-[9px] font-mono uppercase tracking-wider rounded-xs">
                              Selected Champion
                            </span>
                          )}
                        </div>

                        {/* Cross-Validation Score with Std Deviation */}
                        <div className="text-right">
                          <span className="font-mono text-[#EA580C] font-bold text-base">
                            {score !== undefined && score !== null
                              ? Number(score).toFixed(4)
                              : "--"}
                          </span>
                          {model.cv_std != null && (
                            <span className="font-mono text-[10px] text-[#736E67] ml-2">
                              ±{Number(model.cv_std).toFixed(4)}
                            </span>
                          )}
                          <span className="font-mono text-[9px] text-[#736E67] block uppercase tracking-wider">
                            CV Score
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PDF Download */}
            {pdfLink && (
              <div className="text-center">
                <a
                  href={pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#1a1c1c] text-white font-mono text-xs tracking-widest uppercase transition-all hover:bg-[#EA580C] shadow-xl hover:shadow-[#EA580C]/20"
                >
                  <FileDown className="w-4 h-4" />
                  Download Thesis Report
                </a>
              </div>
            )}
          </div>
        )}

        {/* ===================== CHARTS TAB ===================== */}
        {activeTab === "charts" && (
          <div>
            {evaluationPlots &&
            Object.values(evaluationPlots).filter(Boolean).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(evaluationPlots)
                  .filter(([, value]) => value)
                  .map(([key, value], index) => (
                    <div key={index} className="gradient-border-shell">
                      <div className="glass-card border border-white p-6">
                        <div className="font-mono text-[9px] text-[#EA580C] uppercase tracking-[3px] mb-4">
                          {key.replace(/_/g, " ")}
                        </div>
                        <img
                          src={value}
                          alt={key}
                          className="w-full rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="gradient-border-shell">
                <div className="glass-card h-80 border border-white p-6 flex items-center justify-center text-center">
                  <div>
                    <LineChartIcon className="w-10 h-10 text-[#EA580C] mx-auto mb-4 opacity-50" />
                    <h4 className="font-display font-bold text-[#1a1c1c] mb-2">
                      No Evaluation Charts Available
                    </h4>
                    <p className="text-[#736E67] text-sm">
                      The evaluation stage did not generate any plots.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    )}
  </div>
</div>
        </div>
      </div>
    );
  };

  export default function App() {
    const {
      fileName,
      setSelectedFile,
      target,
      setTarget,
      runPipeline,
      isProcessing,
      globalStatus,
      errorMessage,
      failedStage,
      setGlobalStatus,
      logs,
      activeTab,
      setActiveTab,
      metrics,
      pdfLink,
      leaderboard,
      edaPlots,
      evaluationPlots,
    } = useAutoML();

    const [showInterface, setShowInterface] = useState(false);

    return (
      <div className="relative font-sans text-[#1a1c1c] font-medium selection:bg-[#EA580C]/20 selection:text-[#EA580C] flex flex-col min-h-screen">
        <div className="fixed inset-0 bg-noise pointer-events-none z-0"></div>
        <Navigation 
          onStart={() => setShowInterface(true)} 
          onHome={() => setShowInterface(false)}
          showHome={showInterface}
        />
        
        <main className="relative z-10 pt-[72px] flex-grow">
          {showInterface ? (
            <AppInterface
            onHome={() => setShowInterface(false)}
            fileName={fileName}
            setSelectedFile={setSelectedFile}
            target={target}
            setTarget={setTarget}
            runPipeline={runPipeline}
            isProcessing={isProcessing}
            globalStatus={globalStatus}
            errorMessage={errorMessage}
            failedStage={failedStage}
            setGlobalStatus={setGlobalStatus}
            logs={logs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            metrics={metrics}
            pdfLink={pdfLink}
            leaderboard={leaderboard}
            edaPlots={edaPlots}
            evaluationPlots={evaluationPlots}
          />
          ) : (
            <>
              <Hero onStart={() => setShowInterface(true)} />
              <FrictionPoint />
              <Intelligence />
              <ExperienceFlow />
              <Innovation />
              <CTA onStart={() => setShowInterface(true)} />
            </>
          )}
        </main>
        
        <Footer />
      </div>
    );
  }

