import React from 'react';

interface VideoCardSkeletonProps {
  aspectRatio?: string;
  showTitle?: boolean;
  showBadges?: boolean;
  showToolIcons?: boolean;
}

const VideoCardSkeleton: React.FC<VideoCardSkeletonProps> = ({
  aspectRatio = '2/3',
  showTitle = true,
  showBadges = true,
  showToolIcons = false
}) => {
  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden rounded-lg bg-slate-800/40 mb-4" style={{ aspectRatio }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-shimmer" />
        </div>

        {showBadges && (
          <div className="absolute top-3 right-3 w-16 h-6 bg-slate-700/40 rounded animate-pulse" />
        )}

        {showTitle && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 pt-12">
            <div className="space-y-2">
              <div className="h-5 bg-slate-700/50 rounded w-4/5 animate-pulse" />
              <div className="h-5 bg-slate-700/40 rounded w-3/5 animate-pulse" />
            </div>

            {showToolIcons && (
              <div className="flex items-center space-x-2 mt-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-slate-700/40 rounded-sm animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
