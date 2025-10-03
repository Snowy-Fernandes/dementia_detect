import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MessageCircle, Heart, User, Search, TrendingUp } from 'lucide-react-native';

interface Post {
  id: string;
  author: string;
  avatarColor: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Sarah M.',
    avatarColor: '#4A90E2',
    title: 'Tips for Daily Memory Exercises',
    content: 'I\'ve been doing these memory games every morning and seeing great results! Anyone else have a routine that works?',
    category: 'Memory',
    likes: 24,
    comments: 12,
    timeAgo: '2h ago',
  },
  {
    id: '2',
    author: 'John D.',
    avatarColor: '#27AE60',
    title: 'Looking for Support Group',
    content: 'Recently diagnosed and looking for others to connect with. Would love to hear your experiences.',
    category: 'Support',
    likes: 18,
    comments: 8,
    timeAgo: '4h ago',
  },
  {
    id: '3',
    author: 'Emily R.',
    avatarColor: '#9B59B6',
    title: 'Nutrition and Brain Health',
    content: 'What foods have you found helpful? I\'ve been focusing on omega-3 rich foods and seeing improvements.',
    category: 'Wellness',
    likes: 31,
    comments: 15,
    timeAgo: '6h ago',
  },
  {
    id: '4',
    author: 'Michael T.',
    avatarColor: '#E74C3C',
    title: 'Exercise Routines That Help',
    content: 'Started walking 30 minutes daily. The mental clarity is amazing! What exercise do you recommend?',
    category: 'Exercise',
    likes: 27,
    comments: 10,
    timeAgo: '8h ago',
  },
];

const categories = ['All', 'Memory', 'Support', 'Wellness', 'Exercise', 'Tips'];

export default function CommunityScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredPosts = mockPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <Text style={styles.headerSubtitle}>Connect, share, and support</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color="#7F8C8D" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95A5A6"
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts */}
      <ScrollView
        style={styles.postsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.trendingBadge}>
          <TrendingUp color="#E74C3C" size={16} />
          <Text style={styles.trendingText}>Trending Discussions</Text>
        </View>

        {filteredPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            activeOpacity={0.8}
          >
            <View style={styles.postHeader}>
              <View
                style={[styles.avatar, { backgroundColor: post.avatarColor }]}
              >
                <Text style={styles.avatarText}>{getInitials(post.author)}</Text>
              </View>
              <View style={styles.postHeaderInfo}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.timeAgo}>{post.timeAgo}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{post.category}</Text>
              </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>
              {post.content}
            </Text>

            <View style={styles.postFooter}>
              <View style={styles.postStat}>
                <Heart color="#E74C3C" size={18} />
                <Text style={styles.postStatText}>{post.likes}</Text>
              </View>
              <View style={styles.postStat}>
                <MessageCircle color="#4A90E2" size={18} />
                <Text style={styles.postStatText}>{post.comments}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create Post Button */}
      <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
        <Text style={styles.createButtonText}>+ New Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  categoryTextActive: {
    color: '#fff',
  },
  postsContainer: {
    flex: 1,
    marginTop: 20,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  trendingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E74C3C',
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#95A5A6',
  },
  categoryBadge: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  createButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 120,
  },
});