import { MarketingNavbar } from '@/components/layout';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsPage() {
  const testimonials = [
      {
          name: "Sarah Johnson",
          role: "Marketing Director",
          company: "TechGrowth Inc.",
          text: "InsightBoard completely transformed how I present campaign data. I used to spend hours in Excel; now it takes minutes to build a dashboard.",
          rating: 5
      },
      {
          name: "Michael Chen",
          role: "Solo Founder",
          company: "StartUp Flow",
          text: "As a solo founder, I need tools that just work. The trial let me see the value immediately. The $5 pricing is a no-brainer.",
          rating: 5
      },
      {
          name: "Emily Davis",
          role: "Data Analyst",
          company: "Creative Solutions",
          text: "The ability to customize widgets and KPIs specifically for my needs is fantastic. The clean design impresses my clients every time.",
          rating: 4
      },
      {
          name: "David Wilson",
          role: "Product Manager",
          company: "NextLevel Soft",
          text: "Simple, fast, and effective. The PDF export feature is a lifesaver for my weekly stakeholder meetings.",
          rating: 5
      },
      {
          name: "Lisa Anderson",
          role: "Operations Manager",
          company: "Logistics Co.",
          text: "We track our daily shipments using the file upload feature. It’s reliable and the visualizations are spot on.",
          rating: 5
      },
      {
          name: "James Lee",
          role: "Freelance Consultant",
          company: "Self-Employed",
          text: "I recommend this to all my small business clients who need better visibility into their finances without expensive software.",
          rating: 4
      }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
       <MarketingNavbar />

       <main className="container mx-auto px-6 py-20 relative z-10">
           <div className="text-center mb-16">
               <h1 className="text-4xl md:text-5xl font-bold mb-4">Loved by Founders & Teams</h1>
               <p className="text-slate-400">Don&apos;t just take our word for it. See what our community has to say.</p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {testimonials.map((t, i) => (
                   <div key={i} className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 relative">
                       <Quote className="absolute top-6 right-6 text-slate-700 w-8 h-8" />
                       <div className="flex gap-1 mb-4">
                           {[...Array(5)].map((_, starIndex) => (
                               <Star 
                                 key={starIndex} 
                                 size={16} 
                                 className={`${starIndex < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`}  
                                />
                           ))}
                       </div>
                       <p className="text-slate-300 mb-6 italic">&quot;{t.text}&quot;</p>
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                               {t.name.charAt(0)}
                           </div>
                           <div>
                               <h4 className="font-semibold text-white text-sm">{t.name}</h4>
                               <p className="text-slate-500 text-xs">{t.role}, {t.company}</p>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </main>
    </div>
  );
}
