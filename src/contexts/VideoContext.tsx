import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Video } from '../lib/database';

interface VideoContextType {
  currentVideo: Video | null;
  isPlaying: boolean;
  isPiPActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement> | null;
  setCurrentVideo: (video: Video | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement>) => void;
  enterPiP: () => Promise<void>;
  exitPiP: () => Promise<void>;
  returnToVideo: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

interface VideoProviderProps {
  children: ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [videoRef, setVideoRef] = useState<React.RefObject<HTMLVideoElement> | null>(null);

  const enterPiP = async () => {
    if (!videoRef?.current || !document.pictureInPictureEnabled) {
      console.warn('Picture-in-Picture not supported or video not available');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      
      await videoRef.current.requestPictureInPicture();
      setIsPiPActive(true);
      
      // Add click handler to PiP video to return to video page
      videoRef.current.addEventListener('click', returnToVideo);
      
      // Listen for PiP exit
      videoRef.current.addEventListener('leavepictureinpicture', () => {
        setIsPiPActive(false);
        videoRef.current?.removeEventListener('click', returnToVideo);
      });
      
    } catch (error) {
      console.error('Failed to enter Picture-in-Picture:', error);
    }
  };

  const exitPiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      setIsPiPActive(false);
    } catch (error) {
      console.error('Failed to exit Picture-in-Picture:', error);
    }
  };

  const returnToVideo = () => {
    if (currentVideo) {
      const urlPrefix = currentVideo.tipo === 'prompt' ? '/prompt/' : '/video/';
      navigate(urlPrefix + currentVideo.slug);
      exitPiP();
    }
  };

  const value: VideoContextType = {
    currentVideo,
    isPlaying,
    isPiPActive,
    videoRef,
    setCurrentVideo,
    setIsPlaying,
    setVideoRef,
    enterPiP,
    exitPiP,
    returnToVideo
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};