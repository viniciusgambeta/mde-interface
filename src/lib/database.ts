import { supabase } from './supabase';
import type { Category } from './database';
import type { DifficultyLevel } from './database';

// Database types
export interface Instructor {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  social_instagram?: string;
  social_linkedin?: string;
  social_github?: string;
  social_website?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  created_at: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  color: string;
  created_at: string;
}

export interface VideoMaterial {
  id: string;
  video_id: string;
  title: string;
  description?: string;
  type: 'download' | 'link' | 'document';
  url: string;
  file_size_mb?: number;
  icon: string;
  order_index: number;
  created_at: string;
}

export interface FerramentaLink {
  id: string;
  nome: string;
  icone: string;
  link: string;
  created_at: string;
}

export interface FeaturedContent {
  id: string;
  nome_botao: string;
  link_botao: string;
  titulo: string;
  descricao?: string;
  tag?: string;
  status: boolean;
  imagem_background?: string;
  created_at: string;
  updated_at: string;
}

export interface SecondaryHighlight {
  id: string;
  nome: string;
  descricao?: string;
  titulo_botao: string;
  link: string;
  imagem?: string;
  posicao: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  nome: string;
  logo: string;
  descricao: string;
  desconto: string;
  codigo_cupom: string;
  categoria: string;
  link: string;
  preco_original?: string;
  preco_desconto?: string;
  valido_ate?: string;
  usado_por: number;
  avaliacao: number;
  visibilidade: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface VideoSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  etapa: 'sugestao' | 'producao' | 'prontas';
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  duration_minutes: number;
  instructor_id?: string;
  category_id?: string;
  difficulty_level_id?: string;
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  upvote_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  tipo: 'video' | 'prompt' | 'live';
  prompt_content?: string;
  status: string;
  data_live?: string;
  
  // Joined data
  instructor?: Instructor;
  category?: Category;
  difficulty_level?: DifficultyLevel;
  materials?: VideoMaterial[];
  ferramentas?: FerramentaLink[];
  versions?: Video[];
  is_bookmarked?: boolean;
  is_upvoted?: boolean;
}

export interface VideoVersion {
  id: string;
  main_video_id: string;
  version_video_id: string;
  version_name: string;
  version_order: number;
  created_at: string;
}

// Database functions
export const videoService = {
  // Get all videos with related data
  async getVideos(options: {
    category?: string;
    difficulty?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    userId?: string;
  } = {}) {
    let query = supabase
      .from('videos')
      .select(`
        *,
        instructor:instructors(*),
        category:categories(*),
        difficulty_level:difficulty_levels(*),
        materials:video_materials(*),
        ferramentas:video_ferramentas(
          ferramenta:ferramentas_links(*)
        )
      `)
      .order('published_at', { ascending: false });

    if (options.category) {
      query = query.eq('category.slug', options.category);
    }

    if (options.difficulty) {
      query = query.eq('difficulty_level.slug', options.difficulty);
    }

    if (options.featured) {
      query = query.eq('is_featured', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    const videos = data as Video[];

    // Transform ferramentas data structure
    videos.forEach(video => {
      if (video.ferramentas) {
        video.ferramentas = (video.ferramentas as any[]).map((item: any) => item.ferramenta).filter(Boolean);
      }
    });

    // If user is provided, check bookmark status for each video
    if (options.userId && videos.length > 0) {
      const bookmarkStatuses = await this.getBookmarkStatuses(
        videos.map(v => v.id), 
        options.userId
      );
      
      videos.forEach(video => {
        video.is_bookmarked = bookmarkStatuses[video.id] || false;
      });
    }

    return videos;
  },

  // Get bookmark statuses for multiple videos
  async getBookmarkStatuses(videoIds: string[], userId: string): Promise<Record<string, boolean>> {
    if (!videoIds.length || !userId) {
      return {};
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('video_id')
      .eq('user_id', userId)
      .in('video_id', videoIds);

    if (error) {
      console.error('Error fetching bookmark statuses:', error);
      return {};
    }

    const bookmarkedVideoIds = new Set(data.map(item => item.video_id));
    const statuses: Record<string, boolean> = {};
    
    videoIds.forEach(videoId => {
      statuses[videoId] = bookmarkedVideoIds.has(videoId);
    });

    return statuses;
  },

  // Get a single video by slug
  async getVideoBySlug(slug: string, userId?: string) {
    let query = supabase
      .from('videos')
      .select(`
        *,
        instructor:instructors(*),
        category:categories(*),
        difficulty_level:difficulty_levels(*),
        materials:video_materials(*),
        ferramentas:video_ferramentas(
          ferramenta:ferramentas_links(*)
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    const { data: video, error } = await query;

    if (error) {
      console.error('Error fetching video:', error);
      return null;
    }

    if (!video) {
      return null;
    }

    // Transform ferramentas data structure
    if (video.ferramentas) {
      video.ferramentas = (video.ferramentas as any[]).map((item: any) => item.ferramenta).filter(Boolean);
    }

    // Get all versions of this video
    const versions = await this.getVideoVersions(video.id, userId);
    video.versions = versions;
    
    // If user is logged in, check if they bookmarked/upvoted this video
    if (userId) {
      const [isBookmarked, isUpvoted] = await Promise.all([
        this.isBookmarked(video.id, userId),
        this.isUpvoted(video.id, userId)
      ]);

      video.is_bookmarked = isBookmarked;
      video.is_upvoted = isUpvoted;
    }

    return video as Video;
  },

  // Get featured videos
  async getFeaturedVideos(limit = 5, userId?: string) {
    return this.getVideos({ featured: true, limit, userId });
  },

  // Get videos by category
  async getVideosByCategory(categorySlug: string, limit = 12, userId?: string) {
    return this.getVideos({ category: categorySlug, limit, userId });
  },

  // Get all versions of a video
  async getVideoVersions(videoId: string, userId?: string): Promise<{ versions: Video[], currentIsMain: boolean }> {
    if (!videoId) {
      console.log('getVideoVersions: No videoId provided');
      return { versions: [], currentIsMain: false };
    }

    console.log('getVideoVersions: Called for videoId:', videoId);

    try {
      // Get ALL relations where this video appears (as main_video_id OR version_video_id)
      const { data: relatedVersions, error: versionsError } = await supabase
        .from('video_versions')
        .select('main_video_id, version_video_id, version_name, version_order')
        .or(`main_video_id.eq.${videoId},version_video_id.eq.${videoId}`);

      if (versionsError) {
        console.error('getVideoVersions: Error fetching versions:', versionsError);
        return { versions: [], currentIsMain: false };
      }

      if (!relatedVersions || relatedVersions.length === 0) {
        console.log('getVideoVersions: No versions found for videoId:', videoId);
        return { versions: [], currentIsMain: false };
      }

      // Now we need to get ALL videos that are related to ANY of these relations
      // This means we need to find all videos that share the same "group"
      const allRelatedVideoIds = new Set<string>();
      let currentIsMain = false;

      // First, collect all main_video_ids and version_video_ids from the initial relations
      relatedVersions.forEach(relation => {
        allRelatedVideoIds.add(relation.main_video_id);
        allRelatedVideoIds.add(relation.version_video_id);
        
        // Check if current video is a main video
        if (relation.main_video_id === videoId) {
          currentIsMain = true;
        }
      });

      // Now get ALL relations for ALL these video IDs to ensure we have the complete group
      const allVideoIds = Array.from(allRelatedVideoIds);
      const { data: completeRelations, error: completeError } = await supabase
        .from('video_versions')
        .select('main_video_id, version_video_id, version_name, version_order')
        .or(`main_video_id.in.(${allVideoIds.join(',')}),version_video_id.in.(${allVideoIds.join(',')})`);

      if (completeError) {
        console.error('getVideoVersions: Error fetching complete relations:', completeError);
        // Fall back to original relations
      } else if (completeRelations) {
        // Add any additional video IDs we found
        completeRelations.forEach(relation => {
          allRelatedVideoIds.add(relation.main_video_id);
          allRelatedVideoIds.add(relation.version_video_id);
        });
      }

      // Remove the current video from the list (we don't want to show it in its own versions)
      allRelatedVideoIds.delete(videoId);


      const versionIds = Array.from(allRelatedVideoIds);
      console.log('getVideoVersions: Found related video IDs:', versionIds);
      
      if (versionIds.length === 0) {
        console.log('getVideoVersions: No other versions found');
        return { versions: [], currentIsMain };
      }
      
      const { data: fullVersions, error: fullVersionsError } = await supabase
        .from('videos')
        .select(`
          *,
          instructor:instructors(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          materials:video_materials(*),
          ferramentas:video_ferramentas(
            ferramenta:ferramentas_links(*)
          )
        `)
        .in('id', versionIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (fullVersionsError) {
        console.error('getVideoVersions: Error fetching full version data:', fullVersionsError);
        return { versions: [], currentIsMain };
      }

      const videoVersions = fullVersions as Video[];

      // Add version metadata to each video using the complete relations
      const allRelations = completeRelations || relatedVersions;
      const sortedVersions = videoVersions.map(video => {
        // Find the relation that defines this video's version info  
        const relation = allRelations.find(r => 
          r.version_video_id === video.id || r.main_video_id === video.id
        );
        
        if (relation) {
          if (relation.main_video_id === video.id) {
            // This video is a main video
            (video as any).version_name = 'Original';
            (video as any).is_main_version = true;
            (video as any).version_order = 0;
          } else {
            // This video is a version
            (video as any).version_name = relation.version_name;
            (video as any).is_main_version = false;
            (video as any).version_order = relation.version_order;
          }
        }
        
        return video;
      }).sort((a, b) => {
        // Sort by version_order, with main videos (order 0) first
        const aOrder = (a as any).version_order || 999;
        const bOrder = (b as any).version_order || 999;
        return aOrder - bOrder;
      });

      // Transform ferramentas data structure
      sortedVersions.forEach(video => {
        if (video.ferramentas) {
          video.ferramentas = (video.ferramentas as any[]).map((item: any) => item.ferramenta).filter(Boolean);
        }
      });

      // If user is provided, check bookmark status for each version
      if (userId && sortedVersions.length > 0) {
        const bookmarkStatuses = await this.getBookmarkStatuses(
          sortedVersions.map(v => v.id), 
          userId
        );
        
        sortedVersions.forEach(video => {
          video.is_bookmarked = bookmarkStatuses[video.id] || false;
        });
      }

      console.log('getVideoVersions: Returning versions:', sortedVersions.map(v => ({ 
        id: v.id, 
        title: v.title, 
        version_name: (v as any).version_name,
        is_main: (v as any).is_main_version
      })));
      
      return { versions: sortedVersions, currentIsMain };
    } catch (error) {
      console.error('getVideoVersions: Exception:', error);
      return { versions: [], currentIsMain: false };
    }
  },

  // Check if video is bookmarked by user
  async isBookmarked(videoId: string, userId: string): Promise<boolean> {
    if (!videoId || !userId) return false;

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }

    return !!data;
  },

  // Check if video is upvoted by user
  async isUpvoted(videoId: string, userId: string): Promise<boolean> {
    if (!videoId || !userId) return false;

    const { data, error } = await supabase
      .from('video_upvotes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking upvote status:', error);
      return false;
    }

    return !!data;
  },

  // Get bookmarked videos for a user
  async getBookmarkedVideos(userId: string): Promise<Video[]> {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(`
        video:videos(
          *,
          instructor:instructors(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          materials:video_materials(*),
          ferramentas:video_ferramentas(
            ferramenta:ferramentas_links(*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarked videos:', error);
      return [];
    }

    // Extract videos from the nested structure and mark them as bookmarked
    const videos = (data || [])
      .map(item => item.video)
      .filter(Boolean) as Video[];

    // Transform ferramentas data structure and mark all as bookmarked
    videos.forEach(video => {
      if (video.ferramentas) {
        video.ferramentas = (video.ferramentas as any[]).map((item: any) => item.ferramenta).filter(Boolean);
      }
      video.is_bookmarked = true;
    });

    return videos;
  },

  // Toggle video bookmark
  async toggleBookmark(videoId: string, userId: string): Promise<boolean> {
    if (!videoId || !userId) return false;

    try {
      // Check if bookmark exists
      const isCurrentlyBookmarked = await this.isBookmarked(videoId, userId);

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error removing bookmark:', error);
          return false;
        }
        
        console.log('Bookmark removed successfully');
        return true;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ 
            video_id: videoId, 
            user_id: userId 
          });
        
        if (error) {
          console.error('Error adding bookmark:', error);
          return false;
        }
        
        console.log('Bookmark added successfully');
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  },

  // Optimized toggle bookmark that returns the new state
  async toggleBookmarkOptimized(videoId: string, userId: string): Promise<{ success: boolean; isBookmarked: boolean }> {
    if (!videoId || !userId) return { success: false, isBookmarked: false };

    try {
      // Check if bookmark exists
      const { data: existing } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error removing bookmark:', error);
          return { success: false, isBookmarked: true };
        }
        
        return { success: true, isBookmarked: false };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ 
            video_id: videoId, 
            user_id: userId 
          });
        
        if (error) {
          console.error('Error adding bookmark:', error);
          return { success: false, isBookmarked: false };
        }
        
        return { success: true, isBookmarked: true };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return { success: false, isBookmarked: false };
    }
  },

  // Toggle video upvote
  async toggleUpvote(videoId: string, userId: string): Promise<boolean> {
    if (!videoId || !userId) return false;

    try {
      const isCurrentlyUpvoted = await this.isUpvoted(videoId, userId);

      if (isCurrentlyUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('video_upvotes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error removing upvote:', error);
          return false;
        }
        
        return true;
      } else {
        // Add upvote
        const { error } = await supabase
          .from('video_upvotes')
          .insert({ 
            video_id: videoId, 
            user_id: userId 
          });
        
        if (error) {
          console.error('Error adding upvote:', error);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      return false;
    }
  },

  // Record video view
  async recordView(videoId: string, userId?: string, watchDuration = 0): Promise<boolean> {
    if (!videoId) {
      console.error('recordView: videoId is required');
      return false;
    }

    console.log('recordView: Recording view for video:', videoId, 'user:', userId);

    try {
      const { error } = await supabase
        .from('video_views')
        .insert({
          video_id: videoId,
          user_id: userId,
          watch_duration_seconds: watchDuration,
          completed: watchDuration > 0
        });

      if (error) {
        console.error('recordView: Error inserting view:', error);
        return false;
      }

      console.log('recordView: Successfully recorded view');
      return true;
    } catch (error) {
      console.error('recordView: Exception:', error);
      return false;
    }
  },

  // Get updated video with fresh counts
  async getVideoWithFreshCounts(videoId: string, userId?: string): Promise<Video | null> {
    if (!videoId) return null;

    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        instructor:instructors(*),
        category:categories(*),
        difficulty_level:difficulty_levels(*),
        materials:video_materials(*),
        ferramentas:video_ferramentas(
          ferramenta:ferramentas_links(*)
        )
      `)
      .eq('id', videoId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching video with fresh counts:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform ferramentas data structure
    if (data.ferramentas) {
      data.ferramentas = (data.ferramentas as any[]).map((item: any) => item.ferramenta).filter(Boolean);
    }

    // If user is logged in, check if they bookmarked/upvoted this video
    if (userId) {
      const [isBookmarked, isUpvoted] = await Promise.all([
        this.isBookmarked(data.id, userId),
        this.isUpvoted(data.id, userId)
      ]);

      data.is_bookmarked = isBookmarked;
      data.is_upvoted = isUpvoted;
    }

    return data as Video;
  },

  // Refresh video counts from database
  async refreshVideoCounts(videoId: string): Promise<{ view_count: number; upvote_count: number } | null> {
    if (!videoId) return null;

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('view_count, upvote_count')
        .eq('id', videoId)
        .maybeSingle();

      if (error) {
        console.error('Error refreshing video counts:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception refreshing video counts:', error);
      return null;
    }
  }
};

// Category service
export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data as Category[];
  }
};

// Difficulty service
export const difficultyService = {
  async getDifficultyLevels() {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching difficulty levels:', error);
      return [];
    }

    return data as DifficultyLevel[];
  }
};

// Featured content service
export const featuredContentService = {
  async getActiveFeaturedContent(): Promise<FeaturedContent | null> {
    const { data, error } = await supabase
      .from('featured_content')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching featured content:', error);
      return null;
    }

    return data as FeaturedContent | null;
  },

  async getAllActiveFeaturedContent(): Promise<FeaturedContent[]> {
    const { data, error } = await supabase
      .from('featured_content')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all featured content:', error);
      return [];
    }

    return data as FeaturedContent[];
  }
};

// Secondary highlights service
export const secondaryHighlightsService = {
  async getActiveSecondaryHighlights(): Promise<SecondaryHighlight[]> {
    const { data, error } = await supabase
      .from('secondary_highlights')
      .select('*')
      .eq('status', true)
      .order('posicao', { ascending: true });

    if (error) {
      console.error('Error fetching secondary highlights:', error);
      return [];
    }

    return data as SecondaryHighlight[];
  }
};

// Coupon service
export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('visibilidade', true)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }

    return data as Coupon[];
  }
};

// Video suggestions service
export const videoSuggestionsService = {
  async createSuggestion(suggestion: {
    title: string;
    description: string;
    category: string;
    user_id?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('video_suggestions')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          user_id: suggestion.user_id,
          status: 'pending',
          etapa: 'sugestao'
        });

      if (error) {
        console.error('Error creating video suggestion:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating video suggestion:', error);
      return false;
    }
  },

  async getApprovedSuggestions(): Promise<VideoSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('video_suggestions')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved suggestions:', error);
        return [];
      }

      return data as VideoSuggestion[];
    } catch (error) {
      console.error('Error fetching approved suggestions:', error);
      return [];
    }
  },

  async toggleUpvote(suggestionId: string, userId: string): Promise<{ success: boolean; votes: number }> {
    if (!suggestionId || !userId) {
      return { success: false, votes: 0 };
    }

    try {
      // Check if user already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('video_suggestion_votes')
        .select('id')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing vote:', checkError);
        return { success: false, votes: 0 };
      }

      if (existingVote) {
        // Remove vote
        const { error: deleteError } = await supabase
          .from('video_suggestion_votes')
          .delete()
          .eq('suggestion_id', suggestionId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error removing vote:', deleteError);
          return { success: false, votes: 0 };
        }
      } else {
        // Add vote
        const { error: insertError } = await supabase
          .from('video_suggestion_votes')
          .insert({
            suggestion_id: suggestionId,
            user_id: userId
          });

        if (insertError) {
          console.error('Error adding vote:', insertError);
          return { success: false, votes: 0 };
        }
      }

      // Get updated vote count
      const { data: suggestion, error: countError } = await supabase
        .from('video_suggestions')
        .select('votes')
        .eq('id', suggestionId)
        .single();

      if (countError) {
        console.error('Error getting vote count:', countError);
        return { success: false, votes: 0 };
      }

      return { success: true, votes: suggestion.votes || 0 };
    } catch (error) {
      console.error('Error toggling upvote:', error);
      return { success: false, votes: 0 };
    }
  },

  async getUserVotes(userId: string): Promise<string[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('video_suggestion_votes')
        .select('suggestion_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user votes:', error);
        return [];
      }

      return data.map(vote => vote.suggestion_id);
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return [];
    }
  },

  async getUserPendingSuggestions(userId: string): Promise<VideoSuggestion[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('video_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user pending suggestions:', error);
        return [];
      }

      return data as VideoSuggestion[];
    } catch (error) {
      console.error('Error fetching user pending suggestions:', error);
      return [];
    }
  }
};