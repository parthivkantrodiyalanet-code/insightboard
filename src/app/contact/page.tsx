import MarketingNavbar from '@/components/MarketingNavbar';
import { MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
       {/* Background Gradients */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <MarketingNavbar />

      <main className="container mx-auto px-6 py-20 relative z-10">
         <div className="max-w-4xl mx-auto">
             <div className="text-center mb-16">
                 <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                 <p className="text-slate-400">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
             </div>

             <div className="grid md:grid-cols-2 gap-12">
                 {/* Contact Form */}
                 <div className="glass-card p-8">
                     <form className="space-y-6">
                         <div className="grid md:grid-cols-2 gap-6">
                             <div>
                                 <label className="text-sm text-slate-400 mb-2 block">First Name</label>
                                 <input type="text" className="input-field bg-slate-800/50" placeholder="John" />
                             </div>
                             <div>
                                 <label className="text-sm text-slate-400 mb-2 block">Last Name</label>
                                 <input type="text" className="input-field bg-slate-800/50" placeholder="Doe" />
                             </div>
                         </div>
                         <div>
                             <label className="text-sm text-slate-400 mb-2 block">Email</label>
                             <input type="email" className="input-field bg-slate-800/50" placeholder="john@example.com" />
                         </div>
                         <div>
                             <label className="text-sm text-slate-400 mb-2 block">Message</label>
                             <textarea className="input-field bg-slate-800/50 h-32 resize-none" placeholder="Tell us how we can help..." />
                         </div>
                         <button type="submit" className="btn-primary w-full">Send Message</button>
                     </form>
                 </div>

                 {/* Contact Info */}
                 <div className="space-y-8 py-8">
                     <div>
                         <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                         <div className="space-y-6">
                             <div className="flex items-start gap-4">
                                 <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                     <Mail size={24} />
                                 </div>
                                 <div>
                                     <h4 className="font-semibold text-white">Email</h4>
                                     <p className="text-slate-400">support@insightboard.com</p>
                                 </div>
                             </div>
                             <div className="flex items-start gap-4">
                                 <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                     <Phone size={24} />
                                 </div>
                                 <div>
                                     <h4 className="font-semibold text-white">Phone</h4>
                                     <p className="text-slate-400">+1 (555) 123-4567</p>
                                 </div>
                             </div>
                             <div className="flex items-start gap-4">
                                 <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                     <MapPin size={24} />
                                 </div>
                                 <div>
                                     <h4 className="font-semibold text-white">Office</h4>
                                     <p className="text-slate-400">
                                         123 Analytics Way<br />
                                         Tech Valley, CA 94043
                                     </p>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="glass-card p-6 bg-slate-800/40 border-slate-700/50">
                         <h4 className="font-semibold text-white mb-2">Support Hours</h4>
                         <p className="text-slate-400 text-sm">
                             Monday - Friday: 9am - 6pm PST<br />
                             Weekend: Limited Support
                         </p>
                     </div>
                 </div>
             </div>
         </div>
      </main>
    </div>
  );
}
