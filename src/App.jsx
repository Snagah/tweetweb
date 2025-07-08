import { useEffect, useState } from 'react';
import { supabase } from './src_supabase';

const TAGS = [
  'BITCOIN', 'CRYPTO', 'RUNES', 'DEFI', 'MARKET',
  'ORDINALS', 'ECOSYSTEM', 'ADOPTION', 'TRADING', 'MEMES', 'MIDL'
];

const RATINGS = [1, 2, 3, 4, 5];

export default function App({ session }) {
  const [tweets, setTweets] = useState([]);
  const [usedTweets, setUsedTweets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [ratingsMap, setRatingsMap] = useState({});
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTweets();
    fetchUsedTweets();
  }, [selectedTags, selectedRatings, filterFavorites, searchTerm]);

  const fetchTweets = async () => {
    const userId = session?.user.id;
    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('used', false)
      .eq('is_active', true)
      .or(`user_id.eq.${userId},user_id.is.null`);

    if (!error && data.length > 0) {
      let filtered = data;

      if (selectedTags.length > 0) {
        filtered = filtered.filter(tweet => tweet.tags.some(tag => selectedTags.includes(tag)));
      }

      if (selectedRatings.length > 0) {
        filtered = filtered.filter(tweet => selectedRatings.includes(tweet.rating));
      }

      if (filterFavorites) {
        filtered = filtered.filter(tweet => tweet.is_favorite);
      }

      if (searchTerm.trim()) {
        filtered = filtered.filter(tweet =>
          (tweet.custom_text || tweet.text).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
      setTweets(shuffled);
      setDebugMessage(`✅ Loaded ${shuffled.length} tweet(s) from database.`);
    } else if (error) {
      setDebugMessage(`❌ Error fetching tweets: ${error.message}`);
    } else {
      setDebugMessage(`⚠️ No tweets found.`);
    }
  };

  const markAsUsed = async (id) => {
    const { error } = await supabase.from('tweets').update({ used: true }).eq('id', id);
    if (!error) {
      setTweets(tweets.filter(tweet => tweet.id !== id));
      fetchUsedTweets();
    }
  };

  const toggleFavorite = async (id, value) => {
    const { error } = await supabase
      .from('tweets')
      .update({ is_favorite: value, user_id: session.user.id })
      .eq('id', id);

    if (!error) {
      setTweets(tweets.map(tweet => tweet.id === id ? { ...tweet, is_favorite: value } : tweet));
    }
  };

  const fetchUsedTweets = async () => {
    const userId = session?.user.id;
    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('used', true)
      .eq('user_id', userId);

    if (!error) setUsedTweets(data);
  };

  const toggleTag = (tag) => {
    const upperTag = tag.toUpperCase();
    setSelectedTags(prev =>
      prev.includes(upperTag) ? prev.filter(t => t !== upperTag) : [...prev, upperTag]
    );
  };

  const toggleRating = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const toggleFilterFavorites = () => {
    setFilterFavorites(prev => !prev);
  };

  const regenerateTweets = () => {
    fetchTweets();
  };

  const rateTweet = async (id, rating) => {
    const { error } = await supabase
      .from('tweets')
      .update({ rating, user_id: session.user.id })
      .eq('id', id);

    if (!error) {
      setRatingsMap({ ...ratingsMap, [id]: rating });
      setTweets(tweets.map(tweet => (tweet.id === id ? { ...tweet, rating } : tweet)));
    }
  };

  const clearRating = async (id) => {
    const { error } = await supabase
      .from('tweets')
      .update({ rating: null })
      .eq('id', id);

    if (!error) {
      setRatingsMap({ ...ratingsMap, [id]: null });
      setTweets(tweets.map(tweet => (tweet.id === id ? { ...tweet, rating: null } : tweet)));
    }
  };

  const saveEditedTweet = async (id) => {
    const { error } = await supabase
      .from('tweets')
      .update({ custom_text: editedText, user_id: session.user.id })
      .eq('id', id);

    if (!error) {
      setTweets(tweets.map(t => t.id === id ? { ...t, custom_text: editedText } : t));
      setEditingTweetId(null);
      setEditedText('');
    }
  };

  const highlightSearch = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return <div className="text-center text-gray-700 p-6">Tweet suggester component (UI omitted)</div>;
}