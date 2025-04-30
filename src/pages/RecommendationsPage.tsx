
import DestinationGrid from '@/components/destinations/DestinationGrid';
import SearchBar from '@/components/destinations/SearchBar';

const RecommendationsPage = () => {
  return (
    <div className="container mx-auto max-w-4xl pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Discover Destinations</h1>
        <div className="mb-6">
          <SearchBar />
        </div>
        <DestinationGrid />
      </div>
    </div>
  );
};

export default RecommendationsPage;
