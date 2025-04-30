
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CtaSection = () => {
  return (
    <section className="py-16 px-4 bg-primary text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-lg mb-8 text-white/80">
          Explore destinations, save your favorites, and plan your next adventure with us.
        </p>
        <Link to="/recommendations">
          <Button variant="secondary" size="lg">
            Explore Destinations <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CtaSection;
