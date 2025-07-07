import { useEffect, useState } from 'react';
import { supabase } from './src_supabase';

const TAGS = [
  'BITCOIN', 'CRYPTO', 'RUNES', 'DEFI', 'MARKET',
  'ORDINALS', 'ECOSYSTEM', 'ADOPTION', 'TRADING', 'MIDL', 'MEMES'
];

export default function App() {
  const [tweets, setTweets] = useState([]);
  const [usedTweets, setUsedTweets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [debugMessage, setDebugMessage] = useState('');

  useEffect(() => {
    fetchTweets();
  }, [selectedTags]);

  const fetchTweets = async () => {
    let query = supabase.from('tweets').select('*').eq('used', false).eq('is_active', true);
    if (selectedTags.length > 0) {
      query = query.contains('tags', selectedTags);
    }
    const { data, error } = await query.limit(5);
    if (!error) {
      setTweets(data);
      setDebugMessage(`✅ Loaded ${data.length} tweet(s) from database.`);
    } else {
      setDebugMessage(`❌ Error fetching tweets: ${error.message}`);
    }
  };

  const markAsUsed = async (id) => {
    const { error } = await supabase.from('tweets').update({ used: true }).eq('id', id);
    if (!error) {
      setTweets(tweets.filter(tweet => tweet.id !== id));
      fetchUsedTweets();
    }
  };

  const fetchUsedTweets = async () => {
    const { data, error } = await supabase.from('tweets').select('*').eq('used', true);
    if (!error) setUsedTweets(data);
  };

  const toggleTag = (tag) => {
    const upperTag = tag.toUpperCase();
    setSelectedTags(prev =>
      prev.includes(upperTag) ? prev.filter(t => t !== upperTag) : [...prev, upperTag]
    );
  };

  const regenerateTweets = () => {
    fetchTweets();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-yellow-100 to-red-200 text-black p-4 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-4xl font-bold text-center mt-4">🚀 Tweet Suggester</h1>

        <div className="text-sm text-gray-700 text-center">{debugMessage}</div>

        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-2">🎯 Filter by tags</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full border transition ${
                  selectedTags.includes(tag) ? 'bg-green-500 text-white' : 'bg-white text-black'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">📝 Suggested Tweets</h2>
          {tweets.length > 0 ? (
            tweets.map(tweet => (
              <div key={tweet.id} className="bg-white rounded-xl p-3 shadow-sm mb-4">
                <p className="mb-2">{tweet.text}</p>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet.text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Tweet it
                  </a>
                  <button
                    onClick={() => markAsUsed(tweet.id)}
                    className="bg-gray-300 text-black px-3 py-1 rounded"
                  >
                    Mark as used
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No tweets available.</p>
          )}
          <div className="flex justify-center mt-2">
            <button
              onClick={regenerateTweets}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition"
            >
              🔄 Regenerate Tweets
            </button>
          </div>
        </div>

        {usedTweets.length > 0 && (
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2">✅ Already Used Tweets</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {usedTweets.map(t => (
                <li key={t.id}>{t.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
