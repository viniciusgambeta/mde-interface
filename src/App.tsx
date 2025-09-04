import React from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import OnboardingFlow from './components/OnboardingFlow';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import VideoPlayer from './components/VideoPlayer';
import PromptViewer from './components/PromptViewer';
import LiveViewer from './components/LiveViewer';
import RegistrationPage from './components/RegistrationPage';
import PasswordResetPage from './components/PasswordResetPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { VideoProvider } from './contexts/VideoContext';
import { videoService } from './lib/database';

// Video Detail Page Component
const VideoDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const handleVideoSelect = (selectedVideo: any) => {
    console.log(`🚀 Navigating to ${selectedVideo.tipo || 'video'}:`, {
      title: selectedVideo.title,
      slug: selectedVideo.slug,
      id: selectedVideo.id,
      tipo: selectedVideo.tipo
    });
    
    // Prevent navigation if already on the same video page
    const currentPath = location.pathname;
    let targetPath = '/video/' + selectedVideo.slug;
    if (selectedVideo.tipo === 'prompt') {
      targetPath = '/prompt/' + selectedVideo.slug;
    } else if (selectedVideo.tipo === 'live') {
      targetPath = '/live/' + selectedVideo.slug;
    }
    
    if (currentPath === targetPath) {
      console.log('🔄 Already on target page, skipping navigation');
      return;
    }
    
    // Navigate to the appropriate URL based on content type
    let urlPrefix = '/video/';
    if (selectedVideo.tipo === 'prompt') {
      urlPrefix = '/prompt/';
    } else if (selectedVideo.tipo === 'live') {
      urlPrefix = '/live/';
    }
    navigate(urlPrefix + selectedVideo.slug);
  };

  React.useEffect(() => {
    const loadVideo = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      try {
        const videoData = await videoService.getVideoBySlug(slug);
        if (videoData) {
          setVideo(videoData);
          // Update page title
          document.title = `Me dá um Exemplo | ${videoData.title}`;
        } else {
          // Video not found, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading video:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [slug, navigate]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
          <span className="text-slate-400">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  // Return the video player/prompt viewer without layout wrapper
  if (video.tipo === 'prompt') {
    return (
      <PromptViewer 
        prompt={video}
        onBack={handleBack}
      />
    );
  } else if (video.tipo === 'live') {
    return (
      <LiveViewer 
        live={video}
        onBack={handleBack}
      />
    );
  } else {
    return (
      <VideoPlayer 
        video={video}
        onBack={handleBack}
      />
    );
  }
};

// Main App Layout Component
const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current view from URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'discover';
    if (path.startsWith('/video/') || path.startsWith('/prompt/') || path.startsWith('/live/')) return 'video-detail';
    return path.substring(1); // Remove leading slash
  };

  const currentView = getCurrentView();

  // Update page title based on current view
  useEffect(() => {
    // Don't update title if page is not visible
    if (document.hidden) {
      return;
    }
    
    const getPageTitle = () => {
      const baseTitle = "Me dá um Exemplo | ";
      switch (currentView) {
        case 'discover': return baseTitle + 'Home';
        case 'trending': return baseTitle + 'Trending';
        case 'categories': return baseTitle + 'Categorias';
        case 'discounts': return baseTitle + 'Descontos';
        case 'affiliates': return baseTitle + 'Afiliados';
        case 'bookmark': return baseTitle + 'Salvos';
        case 'profile': return baseTitle + 'Minha Conta';
        case 'request-lesson': return baseTitle + 'Pedir Aula';
        case 'help': return baseTitle + 'Ajuda';
        case 'video-detail': return document.title; // Keep existing title set by video page
        default: return baseTitle + currentView.charAt(0).toUpperCase() + currentView.slice(1);
      }
    };

    if (currentView !== 'video-detail') {
      document.title = getPageTitle();
    }
  }, [currentView]);

  const handleVideoSelect = (video: any) => {
    console.log(`🚀 Navigating to ${video.tipo || 'video'}:`, {
      title: video.title,
      slug: video.slug,
      id: video.id,
      tipo: video.tipo
    });
    
    // Navigate to the appropriate URL based on content type
    let urlPrefix = '/video/';
    if (video.tipo === 'prompt') {
      urlPrefix = '/prompt/';
    } else if (video.tipo === 'live') {
      urlPrefix = '/live/';
    }
    navigate(urlPrefix + video.slug);
  };

  const handleViewChange = (view: string) => {
    console.log('🔄 Changing view to:', view);
    
    // Map view names to URLs
    const viewUrls: Record<string, string> = {
      'discover': '/',
      'trending': '/trending',
      'categories': '/categories',
      'bookmark': '/bookmark',
      'discounts': '/discounts',
      'affiliates': '/affiliates',
      'profile': '/profile',
      'request-lesson': '/request-lesson',
      'help': '/help'
    };
    
    const url = viewUrls[view] || '/';
    navigate(url);
  };

  // For video detail pages, render with header and sidebar
  if (currentView === 'video-detail') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex flex-col">
        {/* Header - Full Width at Top */}
        <Header 
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onViewChange={handleViewChange}
          onVideoSelect={handleVideoSelect}
        />
        
        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0">
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentView={currentView}
            onViewChange={handleViewChange}
          />
          
          <div className="flex-1 flex flex-col min-w-0">            
            <VideoDetailPage />
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  // For all other pages, use normal layout
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex flex-col">
      {/* Header - Full Width at Top */}
      <Header 
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onViewChange={handleViewChange}
        onVideoSelect={handleVideoSelect}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        
        <div className="flex-1 flex flex-col min-w-0">            
          <div className="px-6 sm:px-8 lg:px-10 pt-6 pb-8 max-w-[1600px] w-full">
            <MainContent 
              currentView={currentView}
              onVideoSelect={handleVideoSelect}
              onViewChange={handleViewChange}
            />
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  console.log('🎯 App: Rendering main App component');
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

// Component that has access to auth context
const AppWithAuth: React.FC = () => {
  const { user, showOnboarding, completeOnboarding, loading } = useAuth();
  
  // Debug logs
  console.log('🔍 AppWithAuth render:', { 
    hasUser: !!user, 
    showOnboarding, 
    loading,
    userEmail: user?.email 
  });
  
  // Show loading screen while auth is initializing
  if (loading) {
    console.log('🔄 AppWithAuth: Showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
          <span className="text-slate-400">Carregando...</span>
        </div>
      </div>
    );
  }

  // Show onboarding if user is logged in but hasn't completed onboarding
  if (user && showOnboarding) {
    console.log('🎯 Showing onboarding flow for user:', user.email);
    console.log('🎯 AppWithAuth: Showing onboarding');
    return (
      <OnboardingFlow
        userId={user.id}
        userEmail={user.email}
        onComplete={completeOnboarding}
      />
    );
  }

  console.log('🎯 AppWithAuth: Showing normal app routes');
  // Normal app routes
  return (
    <VideoProvider>
      <Routes>
        {/* All routes now use the same layout structure */}
        <Route path="/" element={<AppLayout />} />
        <Route path="/trending" element={<AppLayout />} />
        <Route path="/categories" element={<AppLayout />} />
        <Route path="/bookmark" element={<AppLayout />} />
        <Route path="/discounts" element={<AppLayout />} />
        <Route path="/affiliates" element={<AppLayout />} />
        <Route path="/profile" element={<AppLayout />} />
        <Route path="/request-lesson" element={<AppLayout />} />
        <Route path="/help" element={<AppLayout />} />
        <Route path="/video/:slug" element={<AppLayout />} />
        <Route path="/prompt/:slug" element={<AppLayout />} />
        <Route path="/live/:slug" element={<AppLayout />} />
        <Route path="/registro" element={<RegistrationPage />} />
        <Route path="/redefinir-senha" element={<PasswordResetPage />} />
        <Route path="/privacidade" element={<PrivacyPolicyPage />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<AppLayout />} />
      </Routes>
    </VideoProvider>
  );
};
export default App;