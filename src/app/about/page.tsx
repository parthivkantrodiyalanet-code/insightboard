import MarketingNavbar from '@/components/layout/MarketingNavbar';
import { Users, CheckCircle, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <MarketingNavbar />

      <main className="container mx-auto px-6 py-20 relative z-10">
         <div className="max-w-3xl mx-auto text-center mb-20">
             <h1 className="text-4xl md:text-5xl font-bold mb-6">Empowering Data-Driven Decisions</h1>
             <p className="text-xl text-slate-400">
                InsightBoard was built to make data analytics accessible to everyone, from solo founders to enterprise teams. 
                No coding, no complex setup—just insights.
             </p>
         </div>

         <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
             <div className="space-y-6">
                 <h2 className="text-3xl font-bold">Our Mission</h2>
                 <p className="text-slate-400 leading-relaxed">
                     We believe that data shouldn&apos;t be locked behind complex tools or expensive contracts. 
                     Our mission is to democratize data visualization, allowing you to turn a simple Excel sheet into 
                     a powerful dashboard in seconds.
                 </p>
                 <div className="space-y-4">
                     {[
                         "Simplify complex data instantly",
                         "Provide professional-grade visualizations",
                         "Ensure top-tier security and privacy"
                     ].map((item, i) => (
                         <div key={i} className="flex items-center gap-3">
                             <CheckCircle className="text-blue-500 w-5 h-5" />
                             <span className="text-slate-200">{item}</span>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="glass-card p-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                         <TrendingUp className="text-white w-6 h-6" />
                     </div>
                     <div>
                         <h3 className="font-bold text-lg">Growth First</h3>
                         <p className="text-sm text-slate-400">Analytics that scale with you</p>
                     </div>
                 </div>
                 <div className="h-32 bg-slate-800/50 rounded-lg w-full mb-4 relative overflow-hidden">
                     {/* Mock Chart Art */}
                     <div className="absolute bottom-0 left-0 right-0 h-full flex items-end px-4 gap-2">
                         {[40, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                             <div key={i} style={{height: `${h}%`}} className="bg-blue-500/40 w-full rounded-t-sm" />
                         ))}
                     </div>
                 </div>
                 <p className="text-xs text-slate-500 italic">
                     &quot;InsightBoard has transformed how we view our weekly metrics. It&apos;s simply indispensable.&quot;
                 </p>
             </div>
         </div>

         <div className="text-center">
             <h2 className="text-3xl font-bold mb-12">Meet the Team</h2>
             <div className="grid md:grid-cols-3 gap-8">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="glass-card p-6 text-center">
                         <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 border-2 border-slate-700 flex items-center justify-center">
                             <Users className="text-slate-600 w-10 h-10" />
                         </div>
                         <h3 className="font-bold text-lg">Team Member {i}</h3>
                         <p className="text-blue-400 text-sm mb-2">Co-Founder & Lead</p>
                         <p className="text-slate-500 text-sm">Passionate about building intuitive tools for complex problems.</p>
                     </div>
                 ))}
             </div>
         </div>
      </main>
    </div>
  );
}
