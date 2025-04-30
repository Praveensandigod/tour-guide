
import { useInView } from 'react-intersection-observer';

const TravelTips = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section 
      ref={ref}
      className={`py-16 px-4 bg-muted/30 transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Travel Inspiration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Embrace the Unknown</h3>
            <p className="text-muted-foreground">Step outside your comfort zone and discover new perspectives that will transform your worldview.</p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Connect with Cultures</h3>
            <p className="text-muted-foreground">Immerse yourself in local traditions and create authentic connections with people around the world.</p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Collect Moments</h3>
            <p className="text-muted-foreground">Focus on experiences rather than things. The memories you create will last a lifetime.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelTips;
