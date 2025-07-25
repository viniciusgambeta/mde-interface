import { supabase } from './supabase';

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
  tipo: 'video' | 'prompt';
  prompt_content?: string;
  
  // Joined data
  instructor?: Instructor;
  category?: Category;
  difficulty_level?: DifficultyLevel;
  materials?: VideoMaterial[];
  ferramentas?: FerramentaLink[];
  is_bookmarked?: boolean;
  is_upvoted?: boolean;
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
      .single();

    const { data: video, error } = await query;

    if (error) {
      console.error('Error fetching video:', error);
      return null;
    }

    // Transform ferramentas data structure
    if (video && video.ferramentas) {
      video.ferramentas = (video.ferramentas as any[]).map((item: any) => item.ferramenta).filter(Boolean);
    }

    // If user is logged in, check if they bookmarked/upvoted this video
    if (userId && video) {
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
  async recordView(videoId: string, userId?: string, watchDuration = 0) {
    const { error } = await supabase
      .from('video_views')
      .insert({
        video_id: videoId,
        user_id: userId,
        watch_duration_seconds: watchDuration,
        completed: watchDuration > 0
      });

    return !error;
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
}