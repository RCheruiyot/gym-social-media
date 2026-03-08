import React, { FormEvent, useEffect, useState } from 'react';

type Post = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = (await response.json()) as Post[];
      setPosts(data);
      setError('');
    } catch (err) {
      setError('Could not load posts. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, authorName })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setTitle('');
      setContent('');
      setAuthorName('');
      await fetchPosts();
    } catch (err) {
      setError('Could not create post.');
      console.error(err);
    }
  };

  return (
    <main style={{ maxWidth: '720px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Gym Social Media</h1>
      <p>Post workouts, updates, and motivation.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
        />
        <input
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="What did you train today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
        />
        <button type="submit">Create Post</button>
      </form>

      {loading && <p>Loading posts...</p>}
      {error && <p>{error}</p>}

      {!loading && posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <article key={post.id} style={{ padding: '1rem', border: '1px solid #ccc', marginBottom: '0.75rem' }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>
            by {post.authorName} on {new Date(post.createdAt).toLocaleString()}
          </small>
        </article>
      ))}
    </main>
  );
};

export default App;
