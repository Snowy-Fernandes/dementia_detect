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
      avatarColor: '#4A90E2',
      title: 'Tips for Daily Memory Exercises',
      content: 'I\'ve been doing these memory games every morning and seeing great results! Anyone else have a routine that works?',
      category: 'Memory',
      media: { type: 'image', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop' },
      likes: 24,
      likedByUser: false,
      comments: [
        { id: 'c1', author: 'John K.', content: 'This is really helpful!', timeAgo: '1h ago', avatarColor: '#4A90E2' },
        { id: 'c2', author: 'Amy L.', content: 'What games do you recommend?', timeAgo: '30m ago', avatarColor: '#4A90E2' }
      ],
      timeAgo: '2h ago',
    },
    {
      id: '2',
      author: 'John D.',
      avatarColor: '#4A90E2',
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
      avatarColor: '#4A90E2',
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
    Alert.alert('Media Upload', `This would open the ${type} picker in a real app`);
  };

  const handleAddPost = (): void => {
    if (newPost.title.trim() && newPost.content.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: 'You',
        avatarColor: '#4A90E2',
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
              avatarColor: '#4A90E2'
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
              size={18}
              color={post.likedByUser ? '#4A90E2' : '#8E8E93'}
              fill={post.likedByUser ? '#4A90E2' : 'transparent'}
            />
          </View>
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
          style={styles.actionButton}
        >
          <View style={styles.actionIconContainer}>
            <MessageCircle size={18} color="#8E8E93" />
          </View>
          <Text style={styles.actionText}>{post.comments.length}</Text>
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
              placeholderTextColor="#C7C7CC"
              onSubmitEditing={() => handleAddComment(post.id)}
            />
            <TouchableOpacity
              onPress={() => handleAddComment(post.id)}
              style={styles.commentSendButton}
            >
              <Send size={18} color="#FFFFFF" />
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
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Connect and share experiences</Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineCount}>1,234</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#C7C7CC" />
          <TextInput
            placeholder="Search discussions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
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
        <View style={styles.trendingContainer}>
          <View style={styles.trendingBadge}>
            <TrendingUp size={16} color="#4A90E2" />
            <Text style={styles.trendingText}>Trending Now</Text>
          </View>
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
        <Plus size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* New Post Modal */}
      <Modal
        visible={showNewPost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowNewPost(false);
                setMediaPreview(null);
              }}
              style={styles.modalCloseButton}
            >
              <X size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity
              onPress={handleAddPost}
              style={styles.modalPostButton}
            >
              <Text style={styles.modalPostButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.label}>Category</Text>
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
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                placeholder="Share your thoughts..."
                multiline
                numberOfLines={6}
                style={[styles.textInput, styles.textArea]}
                placeholderTextColor="#C7C7CC"
              />
            </View>

            {/* Media Upload */}
            <View style={styles.modalSection}>
              <Text style={styles.label}>Add Media</Text>
              <View style={styles.mediaButtonsContainer}>
                <TouchableOpacity
                  onPress={() => handleMediaUpload('image')}
                  style={styles.mediaButton}
                >
                  <ImageIcon size={20} color="#4A90E2" />
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMediaUpload('video')}
                  style={styles.mediaButton}
                >
                  <Video size={20} color="#4A90E2" />
                  <Text style={styles.mediaButtonText}>Video</Text>
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
                  <X size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  onlineCount: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  trendingContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  trendingText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  postsList: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postContent: {
    flex: 1,
    minWidth: 0,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  dot: {
    color: '#C7C7CC',
    fontSize: 12,
  },
  timeAgo: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  categoryBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    color: '#4A90E2',
    fontSize: 11,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  postContentText: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 20,
    fontWeight: '400',
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoSubtext: {
    color: '#C7C7CC',
    fontSize: 13,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconContainer: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  likedIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 18,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000000',
  },
  commentSendButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#4A90E2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCloseButton: {
    padding: 4,
    width: 60,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  modalPostButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  modalPostButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A90E2',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  categoryPicker: {
    marginBottom: 8,
  },
  categoryOption: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#4A90E2',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#000000',
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
    backgroundColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  mediaButtonText: {
    color: '#4A90E2',
    fontSize: 15,
    fontWeight: '600',
  },
  mediaPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 20,
  },
});

export default CommunityApp;
