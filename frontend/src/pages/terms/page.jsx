import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function TermsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Terms of Service | Octune Vintage';
    const fetchContent = async () => {
      try {
        const res = await api.get('/content');
        setContent(res.data);
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="container mx-auto px-6 lg:px-12 py-20 max-w-4xl min-h-screen">
      <h1 className="font-display text-4xl uppercase tracking-widest mb-12 border-b border-ink/10 pb-6">Terms & Conditions</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-ink/20" size={32} />
        </div>
      ) : (
        <div 
          className="space-y-8 text-sm text-ink/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content?.terms || '<p>Terms and conditions are currently unavailable.</p>' }}
        />
      )}
    </div>
  );
}
