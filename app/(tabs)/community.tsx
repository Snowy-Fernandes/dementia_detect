import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { 
  MessageCircle, 
  Heart, 
  X, 
  Send, 
  TrendingUp, 
  Plus, 
  Image as ImageIcon, 
  Video,
  Search
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
  avatarColor: string;
}

interface Media {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface Post {
  id: string;
  author: string;
  avatarColor: string;
  title: string;
  content: string;
  category: string;
  media: Media | null;
  likes: number;
  likedByUser: boolean;
  comments: Comment[];
  timeAgo: string;
}

const CommunityApp = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Sarah M.',
      avatarColor: '#1e1857ff',
      title: 'Tips for Daily Memory Exercises',
      content: 'I\'ve been doing these memory games every morning and seeing great results! Anyone else have a routine that works?',
      category: 'Memory',
      media: { type: 'image', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop' },
      likes: 24,
      likedByUser: false,
      comments: [
        { id: 'c1', author: 'John K.', content: 'This is really helpful!', timeAgo: '1h ago', avatarColor: '#1e1857ff' },
        { id: 'c2', author: 'Amy L.', content: 'What games do you recommend?', timeAgo: '30m ago', avatarColor: '#1e1857ff' }
      ],
      timeAgo: '2h ago',
    },
    {
      id: '2',
      author: 'John D.',
      avatarColor: '#1e1857ff',
      title: 'Morning Meditation Session',
      content: 'Just finished an amazing meditation session. Feeling centered and ready for the day!',
      category: 'Support',
      media: { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=400&fit=crop' },
      likes: 18,
      likedByUser: false,
      comments: [],
      timeAgo: '4h ago',
    },
    {
      id: '3',
      author: 'Emily R.',
      avatarColor: '#1e1857ff',
      title: 'Nutrition and Brain Health',
      content: 'What foods have you found helpful? I\'ve been focusing on omega-3 rich foods and seeing improvements.',
      category: 'Wellness',
      media: null,
      likes: 31,
      likedByUser: false,
      comments: [],
      timeAgo: '6h ago',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: 'Memory', 
    media: null as Media | null 
  });
  const [newComment, setNewComment] = useState('');
  const [mediaPreview, setMediaPreview] = useState<Media | null>(null);

  const categories = ['All', 'Memory', 'Support', 'Wellness', 'Exercise', 'Tips'];

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLike = (postId: string): void => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser
        };
      }
      return post;
    }));
  };

  const handleMediaUpload = (type: 'image' | 'video'): void => {
    // In a real app, you would use expo-image-picker or expo-document-picker here
    Alert.alert('Media Upload', `This would open the ${type} picker in a real app`);
  };

  const handleAddPost = (): void => {
    if (newPost.title.trim() && newPost.content.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: 'You',
        avatarColor: '#1e1857ff',
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        media: newPost.media,
        likes: 0,
        likedByUser: false,
        comments: [],
        timeAgo: 'Just now',
      };
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '', category: 'Memory', media: null });
      setMediaPreview(null);
      setShowNewPost(false);
    } else {
      Alert.alert('Error', 'Please fill in both title and content');
    }
  };

  const handleAddComment = (postId: string): void => {
    if (newComment.trim()) {
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, {
              id: Date.now().toString(),
              author: 'You',
              content: newComment,
              timeAgo: 'Just now',
              avatarColor: '#1e1857ff'
            }]
          };
        }
        return post;
      }));
      setNewComment('');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderPostItem = ({ item: post }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <View 
            style={[styles.avatar, { backgroundColor: post.avatarColor }]}
          >
            <Text style={styles.avatarText}>{getInitials(post.author)}</Text>
          </View>
        </View>

        <View style={styles.postContent}>
          <View style={styles.postMeta}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContentText}>{post.content}</Text>
        </View>
      </View>

      {/* Media Content */}
      {post.media && (
        <View style={styles.mediaContainer}>
          {post.media.type === 'image' ? (
            <Image 
              source={{ uri: post.media.url }} 
              style={styles.mediaImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>Video Content</Text>
              <Text style={styles.videoSubtext}>Tap to play</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          onPress={() => handleLike(post.id)}
          style={styles.actionButton}
        >
          <View style={[
            styles.actionIconContainer,
            post.likedByUser && styles.likedIconContainer
          ]}>
            <Heart
              size={20}
              color={post.likedByUser ? '#1e1857ff' : '#6B7280'}
              fill={post.likedByUser ? '#1e1857ff' : 'transparent'}
            />
          </View>
          <Text style={styles.actionText}>{post.likes} Likes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
          style={styles.actionButton}
        >
          <View style={styles.actionIconContainer}>
            <MessageCircle size={20} color="#6B7280" />
          </View>
          <Text style={styles.actionText}>{post.comments.length} Comments</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {expandedPost === post.id && (
        <View style={styles.commentsSection}>
          <FlatList
            data={post.comments}
            keyExtractor={(comment) => comment.id}
            renderItem={({ item: comment }) => (
              <View style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View 
                    style={[
                      styles.commentAvatar, 
                      { backgroundColor: comment.avatarColor }
                    ]}
                  >
                    <Text style={styles.commentAvatarText}>
                      {getInitials(comment.author)}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                </View>
              </View>
            )}
            style={styles.commentsList}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              style={styles.commentInput}
              onSubmitEditing={() => handleAddComment(post.id)}
            />
            <TouchableOpacity
              onPress={() => handleAddComment(post.id)}
              style={styles.commentSendButton}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Community Forum</Text>
            <Text style={styles.headerSubtitle}>Connect, share, and support each other</Text>
          </View>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineLabel}>Online Now</Text>
            <Text style={styles.onlineCount}>1,234</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInner}>
            <Search size={20} color="#1e1857ff" />
            <TextInput
              placeholder="Search discussions, topics, or keywords..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Badge */}
        <View style={styles.trendingBadge}>
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.trendingText}>Trending Now</Text>
        </View>

        {/* Posts List */}
        <FlatList
          data={filteredPosts}
          keyExtractor={(post) => post.id}
          renderItem={renderPostItem}
          scrollEnabled={false}
          style={styles.postsList}
        />
      </ScrollView>

      {/* Create Post Button */}
      <TouchableOpacity
        onPress={() => setShowNewPost(true)}
        style={styles.fab}
      >
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>New Post</Text>
      </TouchableOpacity>

      {/* New Post Modal */}
      <Modal
        visible={showNewPost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity
              onPress={() => {
                setShowNewPost(false);
                setMediaPreview(null);
              }}
              style={styles.modalCloseButton}
            >
              <X size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{newPost.category}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {categories.filter(c => c !== 'All').map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewPost({ ...newPost, category: cat })}
                    style={[
                      styles.categoryOption,
                      newPost.category === cat && styles.categoryOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      newPost.category === cat && styles.categoryOptionTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
                placeholder="What's on your mind?"
                style={styles.textInput}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                placeholder="Share your thoughts with the community..."
                multiline
                numberOfLines={4}
                style={[styles.textInput, styles.textArea]}
              />
            </View>

            {/* Media Upload */}
            <View style={styles.modalSection}>
              <Text style={styles.label}>Add Media (Optional)</Text>
              <View style={styles.mediaButtonsContainer}>
                <TouchableOpacity
                  onPress={() => handleMediaUpload('image')}
                  style={styles.mediaButton}
                >
                  <ImageIcon size={20} color="#FFFFFF" />
                  <Text style={styles.mediaButtonText}>Add Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMediaUpload('video')}
                  style={styles.mediaButton}
                >
                  <Video size={20} color="#FFFFFF" />
                  <Text style={styles.mediaButtonText}>Add Video</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Media Preview */}
            {mediaPreview && (
              <View style={styles.mediaPreviewContainer}>
                {mediaPreview.type === 'image' ? (
                  <Image 
                    source={{ uri: mediaPreview.url }} 
                    style={styles.mediaPreview}
                  />
                ) : (
                  <View style={styles.videoPreview}>
                    <Text style={styles.videoPreviewText}>Video Preview</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setMediaPreview(null);
                    setNewPost({ ...newPost, media: null });
                  }}
                  style={styles.removeMediaButton}
                >
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowNewPost(false);
                  setMediaPreview(null);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddPost}
                style={styles.postButton}
              >
                <Text style={styles.postButtonText}>Post Now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    backgroundColor: '#1e1857ff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#DDD6FE',
  },
  onlineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backdropFilter: 'blur(10px)',
  },
  onlineLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  onlineCount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    margin: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#1e1857ff',
    shadowColor: '#1e1857ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e1857ff',
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#1e1857ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  trendingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsList: {
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  postHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  postContent: {
    flex: 1,
    minWidth: 0,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dot: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  timeAgo: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryBadge: {
    backgroundColor: '#1e1857ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#1e1857ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  postContentText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  mediaContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoSubtext: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  likedIconContainer: {
    backgroundColor: '#EDE9FE',
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  commentSendButton: {
    backgroundColor: '#1e1857ff',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#1e1857ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 20,
    paddingRight: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#1e1857ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    backgroundColor: '#1e1857ff',
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 12,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  categoryPicker: {
    marginBottom: 8,
  },
  categoryOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#1e1857ff',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#1e1857ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#1e1857ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaPreviewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  postButton: {
    flex: 1,
    backgroundColor: '#1e1857ff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1e1857ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default CommunityApp;