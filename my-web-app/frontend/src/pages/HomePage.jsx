import React, { useEffect, useState } from 'react';

const HomePage = () => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
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
    fetchPosts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${apiBaseUrl}/api/posts`, {
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
    <section>
      <p>Post workouts, updates, and motivation.</p>

      <form onSubmit={handleSubmit} className="stack-form">
        <input
          placeholder="Your name"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          required
        />
        <input
          placeholder="Post title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <textarea
          placeholder="What did you train today?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={4}
        />
        <button type="submit">Create Post</button>
      </form>

      {loading && <p>Loading posts...</p>}
      {error && <p>{error}</p>}

      {!loading && posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>
            by {post.authorName} on {new Date(post.createdAt).toLocaleString()}
          </small>
        </article>
      ))}
    </section>
  );
};

export default HomePage;
