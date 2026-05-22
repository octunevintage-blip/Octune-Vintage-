'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/contact', formData);
      toast.success(`Query Submitted! Ticket: ${data.ticketId}`, {
        duration: 5000,
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-vnv-white text-vnv-black flex flex-col">
      <div className="container mx-auto px-4 md:px-8 pt-4 pb-12 max-w-4xl flex-grow">
        
        {/* Header */}
        <div className="border-b-4 border-vnv-black pb-6 mb-8 text-center md:text-left">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight uppercase mb-2">
            CONTACT US
          </h1>
          <p className="text-sm md:text-base font-sans max-w-2xl text-vnv-gray">
            For inquiries regarding archive pieces, restocks, press, or existing orders. We aim to respond within 24-48 hours.
          </p>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Info Side */}
          <div className="space-y-8 order-2 md:order-1">
            <div>
              <h3 className="font-display text-xl font-bold uppercase tracking-widest mb-2 border-b border-vnv-black inline-block pb-1">HQ / SHOWROOM</h3>
              <p className="font-sans text-vnv-gray mt-4">
                Octune Vintage Archives<br />
                Aurobindapall Main Road, Siliguri<br />
                India
              </p>
            </div>
            
            <div>
              <h3 className="font-display text-xl font-bold uppercase tracking-widest mb-2 border-b border-vnv-black inline-block pb-1">DIRECT INQUIRIES</h3>
              <p className="font-sans text-vnv-gray mt-4">
                octunevintage@gmail.com<br />
                +91 8250689552
              </p>
            </div>

            <div className="bg-vnv-light-gray p-6 border border-vnv-gray/20">
              <h4 className="font-display text-lg uppercase font-bold tracking-widest mb-2">SOURCING REQUESTS</h4>
              <p className="text-sm text-vnv-gray">
                Looking for a specific grail? Include the brand, season, and sizing in your message and our sourcing team will check our private network.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="order-1 md:order-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="font-display text-xs uppercase font-bold tracking-widest text-vnv-gray">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-vnv-light-gray border border-vnv-gray/30 px-4 py-3 focus:outline-none focus:border-vnv-black transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="JOHN DOE"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display text-xs uppercase font-bold tracking-widest text-vnv-gray">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-vnv-light-gray border border-vnv-gray/30 px-4 py-3 focus:outline-none focus:border-vnv-black transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="JOHN@EXAMPLE.COM"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display text-xs uppercase font-bold tracking-widest text-vnv-gray">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-vnv-light-gray border border-vnv-gray/30 px-4 py-3 focus:outline-none focus:border-vnv-black transition-colors"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="ORDER INQUIRY / SOURCING"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display text-xs uppercase font-bold tracking-widest text-vnv-gray">Message</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full bg-vnv-light-gray border border-vnv-gray/30 px-4 py-3 focus:outline-none focus:border-vnv-black transition-colors resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="HOW CAN WE HELP YOU?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-vnv-black text-vnv-white font-display text-sm font-bold uppercase tracking-widest py-4 hover:bg-vnv-gray transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
