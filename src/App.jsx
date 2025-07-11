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
    const userId = session?.user?.id;
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
    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('used', true)
      .eq('user_id', session.user.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-yellow-100 to-red-200 text-black p-4 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-4xl font-bold text-center mt-4">🚀 Tweet Suggester</h1>
        <div className="text-sm text-gray-700 text-center">{debugMessage}</div>

        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-2">🔍 Search tweets</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter a keyword..."
          />
        </div>

        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-2">🎯 Filter by tags</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full border transition ${selectedTags.includes(tag) ? 'bg-green-500 text-white' : 'bg-white text-black'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-2">🌟 Filter by rating</h2>
          <div className="flex gap-2 justify-center mb-2">
            {RATINGS.map(rating => (
              <button
                key={rating}
                onClick={() => toggleRating(rating)}
                className={`px-3 py-1 rounded-full border transition ${selectedRatings.includes(rating) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              >
                {rating}⭐
              </button>
            ))}
            <button
              onClick={toggleFilterFavorites}
              className={`px-3 py-1 rounded-full border transition ${filterFavorites ? 'bg-pink-500 text-white' : 'bg-white text-black'}`}
            >
              ❤️
            </button>
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">📝 Suggested Tweets</h2>
          {tweets.map(tweet => (
            <div key={tweet.id} className="bg-white rounded-xl p-3 shadow-sm mb-4">
              {editingTweetId === tweet.id ? (
                <>
                  <textarea
                    className="w-full p-2 border rounded mb-2"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <button onClick={() => saveEditedTweet(tweet.id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">💾 Save</button>
                  <button onClick={() => setEditingTweetId(null)} className="bg-gray-300 text-black px-3 py-1 rounded">Cancel</button>
                </>
              ) : (
                <>
                  <p className="mb-6">{highlightSearch(tweet.custom_text || tweet.text)}</p>
                  <div className="border-t pt-2 mt-2 bg-white/60 rounded-md p-2">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet.custom_text || tweet.text)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-3 py-1 rounded">Tweet it</a>
                      <button onClick={() => markAsUsed(tweet.id)} className="bg-gray-300 text-black px-3 py-1 rounded">Mark as used</button>
                      <button onClick={() => { setEditingTweetId(tweet.id); setEditedText(tweet.custom_text || tweet.text); }} className="bg-yellow-400 text-black px-3 py-1 rounded">✏️ Edit</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {tweet.rating ? (
                        <>
                          <span className="text-sm text-gray-700">Rated: {tweet.rating}⭐</span>
                          <button onClick={() => clearRating(tweet.id)} className="text-sm text-blue-500 underline ml-2">Change rating</button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-700">Rate:</span>
                          {RATINGS.map(r => (
                            <button key={r} onClick={() => rateTweet(tweet.id, r)} className="text-sm px-2 py-1 rounded bg-yellow-200 hover:bg-yellow-300">{r}⭐</button>
                          ))}
                        </>
                      )}
                      <button onClick={() => toggleFavorite(tweet.id, !tweet.is_favorite)} className="text-lg px-2">
                        {tweet.is_favorite ? '💔' : '❤️'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="flex justify-center mt-2">
            <button onClick={regenerateTweets} className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition">🔄 Regenerate Tweets</button>
          </div>
        </div>
      </div>
    </div>
  );
}