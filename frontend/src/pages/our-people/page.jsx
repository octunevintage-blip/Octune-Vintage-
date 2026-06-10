import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function OurPeoplesPage() {
  const [images, setImages] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOurPeoples() {
      try {
        const { data } = await api.get('/content');
        if (data) {
          setContent(data);
          if (data.ourPeoples) {
            setImages(data.ourPeoples);
          }
        }
      } catch (error) {
        console.error('Failed to load Our Peoples content:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOurPeoples();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-vnv-white text-vnv-black flex flex-col items-center justify-center pt-20">
        <div className="font-display text-2xl uppercase tracking-widest animate-pulse">LOADING ARCHIVES...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vnv-white py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest text-vnv-black mb-4">
            {content?.ourPeopleContent?.heading || 'Our Happy Customers'}
          </h1>
          <p className="text-vnv-dark-gray text-lg italic">
            {content?.ourPeopleContent?.paragraph || '"You make the clothes look good."'}
          </p>
          <div className="w-16 h-1 bg-brick mx-auto mt-6"></div>
        </div>

        {images.length > 0 ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {images.map((person, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx % 4 * 0.1, duration: 0.5 }}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-sm sm:rounded-md"
              >
                <img 
                  src={person.image} 
                  alt={`Customer Review ${idx + 1}`} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-vnv-dark-gray py-20 uppercase tracking-widest font-display text-xl">
            No photos yet. Be the first to be featured!
          </div>
        )}
      </div>
    </div>
  );
}
