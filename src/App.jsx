import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Remplace ces valeurs par les tiennes :
const supabase = createClient(
  'https://byeaovijxqxgdybaxbnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZWFvdmlqeHF4Z2R5YmF4Ym5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDYwMzQsImV4cCI6MjA2NzM4MjAzNH0.AdAVgyGeGqjer1C96QvfeXI2NHhJmSJiqxT8rOd0jNw'
);

const TAGS = [
  'Bitcoin', 'Crypto', 'Runes', 'DeFi', 'Market',
  'Ordinals', 'Ecosystem', 'Adoption', 'Trading', 'Memes'
];

export default function App() {
  const [tweets, setTweets] = useState([]);
  const [usedTweets, setUsedTweets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchTweets();
    fetchUsedTweets();
  }, [selectedTags]);

  const fetchTweets = async () => {
    let query = supabase.from('tweets').select('*').eq('used', false);
    if (selectedTags.length > 0) {
      query = query.contains('tags', selectedTags);
    }
    const { data, error } = await query.limit(3);
    if (!error) setTweets(data);
  };

  const fetchUsedTweets = async () => {
    const { data, error } = await supabase.from('tweets').select('*').eq('used', true);
    if (!error) setUsedTweets(data);
  };

  const markAsUsed = async (id) => {
    const { error } = await supabase.from('tweets').update({ used: true }).eq('id', id);
    if (!error) {
      setTweets(tweets.filter(tweet => tweet.id !== id));
      fetchUsedTweets();
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-yellow-200 to-red-200 p-4 text-black">
      <h1 className="text-3xl font-bold text-center mb-4">🚀 Tweet Suggester</h1>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full border ${
              selectedTags.includes(tag) ? 'bg-green-500 text-white' : 'bg-white text-black'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-4 mb-6">
        {tweets.map(tweet => (
          <div key={tweet.id} className="bg-white rounded-2xl shadow-md p-4">
            <p className="mb-3">{tweet.text}</p>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet.text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Tweet it
            </a>
            <button
              onClick={() => markAsUsed(tweet.id)}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Mark as used
            </button>
          </div>
        ))}
      </div>

      {usedTweets.length > 0 && (
        <div className="bg-green-50 rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-2">✅ Already Used Tweets</h2>
          <ul className="list-disc list-inside">
            {usedTweets.map(t => (
              <li key={t.id} className="text-gray-600">{t.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
