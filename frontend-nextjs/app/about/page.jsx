export const metadata = {
  title: 'Our Story | Octune Vintage',
  description: 'The origin of Octune Vintage. Curated 1-of-1 thrifted clothing.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-12 md:pt-10 md:pb-20 max-w-7xl text-vnv-black">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column - Image with VNV Style solid drop shadow */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[420px] bg-vnv-light-gray border-4 border-vnv-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <img 
              src="/about_us_photo.png" 
              alt="About Octune Vintage curators" 
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-750 block"
            />
          </div>
        </div>

        {/* Right Column - Story text */}
        <div className="lg:col-span-7 space-y-6 text-vnv-dark-gray leading-relaxed text-sm sm:text-base font-sans">
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight mb-6 text-center font-bold text-vnv-black">About Us</h1>
          
          <p className="text-xl sm:text-2xl italic text-vnv-black tracking-wide font-medium leading-snug border-l-4 border-vnv-black pl-4 py-2">
            "Our best picks of your favourite brands! That’s pretty much what Octune Vintage is all about!"
          </p>
          
          <div className="space-y-4">
            <p>
              We’re a thrifted/second-hand clothing store from West Bengal, India, built around timeless fashion and sustainable shopping! At Octune, we curate pre-loved and vintage pieces that bring style, comfort, and a whole lot of personality to your wardrobe.
            </p>
            <p>
              Think vintage jackets, track tops, jerseys, T-shirts, shorts, pants, and honestly, anything cool we can get our hands on! We only stock one piece of each product. So when you add something to your cart, you know it’s gonna be one of a kind!
            </p>

            <p className="text-lg sm:text-xl font-bold text-vnv-black uppercase tracking-tight pt-4">
              Now, who’s behind Octune?
            </p>
            
            <p>
              Meet <strong>Rubai</strong>, the curator with all the right finds! He’s technically behind sourcing all these cool pieces that you guys fight over! He’s absolutely obsessed with anything retro; be it fashion, bikes or music! Every product is handpicked and checked carefully, because looking good is important, but quality matters just as much. We make sure each piece is sourced with authenticity checks and is in A1 condition.
            </p>
            <p>
              Then there’s <strong>Rupsa</strong>, the social media fairy! She’s the one who decides what goes into a drop and that all the displayed products are squeaky clean, sorted and ready to go! From managing the drops to making sure your parcel reaches you smoothly, she handles the behind-the-scenes chaos so your Octune experience feels seamless from start to finish.
            </p>
            <p>
              Also let’s not forget our <strong>Minati didi</strong>! Our super sweet didi who sorts our inventory, irons the products and makes sure that what we display are up to the mark!
            </p>
            <p>
              And of course, we have <strong>Simba</strong>, our golden CEO. He may not pack orders or help the customers or handpick items or manage social media…wait a sec, why do we have him again? Oh.. he got the job with his absolute cuteness!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
