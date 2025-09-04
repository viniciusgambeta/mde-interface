import React from 'react';
import FeaturedSection from './FeaturedSection';
import VideoGrid from './VideoGrid';
import CategoriesPage from './CategoriesPage';
import HelpPage from './HelpPage';
import RequestLessonPage from './RequestLessonPage';
import ProfilePage from './ProfilePage';
import VideoPlayer from './VideoPlayer';
import PromptViewer from './PromptViewer';
import DiscountsPage from './DiscountsPage';
import AffiliatesPage from './AffiliatesPage';

interface MainContentProps {
  currentView: string;
  onVideoSelect: (video: any) => void;
  onViewChange?: (view: string) => void;
  selectedContent?: any;
  onBack?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ currentView, onVideoSelect, onViewChange }) => {
  const handleVideoSelect = (video: any) => {
    // Forward to App component
    onVideoSelect(video);
  };

  const getTitle = () => {
    switch (currentView) {
      case 'discover': return 'Home';
      case 'trending': return '';
      case 'categories': return '';
      case 'streaming': return 'Live Streams';
      case 'bookmark': return '';
      case 'discounts': return '';
      case 'affiliates': return '';
      case 'profile': return '';
      case 'request-lesson': return '';
      case 'help': return '';
      case 'tutorial': return 'Tutorials';
      case 'gaming': return 'Gaming';
      case 'competition': return 'Sports & Competition';
      case 'community': return 'Community';
      default: return 'Home';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto pr-4 sm:pr-6 lg:pr-8 pt-4 pb-8 transition-all duration-300 ease-in-out w-full">
      <div className="w-full max-w-none">
        {/* Page Title - Only show for non-discover pages */}
        {currentView !== 'discover' && getTitle() && (
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 lg:mb-12 opacity-0 animate-fade-in">
            {getTitle()}
          </h1>
        )}

        {/* Featured Section - Only show on discover page */}
        {currentView === 'discover' && (
          <div className="w-full">
            <FeaturedSection onVideoSelect={handleVideoSelect} onViewChange={onViewChange} />
          </div>
        )}

        {/* Content based on current view */}
        {currentView === 'categories' ? (
          <CategoriesPage onVideoSelect={handleVideoSelect} />
        ) : currentView === 'discounts' ? (
          <DiscountsPage />
        ) : currentView === 'affiliates' ? (
          <AffiliatesPage />
        ) : currentView === 'profile' ? (
          <ProfilePage />
        ) : currentView === 'help' ? (
          <HelpPage />
        ) : currentView === 'request-lesson' ? (
          <RequestLessonPage />
        ) : (
          <VideoGrid 
            currentView={currentView}
            onVideoSelect={handleVideoSelect}
          />
        )}
      </div>
    </main>
  );
};

export default MainContent;