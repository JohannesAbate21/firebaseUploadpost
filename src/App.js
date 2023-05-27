import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set } from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const firebaseConfig = {
  // Add your Firebase configuration here
  apiKey: 'AIzaSyCjYUIQtIGx5osC9vgNkIFz3v-iLqsI9PQ',
  authDomain: 'notes-242c0.firebaseapp.com',
  databaseURL: 'https://notes-242c0-default-rtdb.firebaseio.com',
  projectId: 'notes-242c0',
  storageBucket: 'notes-242c0.appspot.com',
  messagingSenderId: '378520659218',
  appId: '1:378520659218:web:6b991fbc66d4f1c0f43fcb',
};

initializeApp(firebaseConfig);
const database = getDatabase();
const storage = getStorage();

const App = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.entries(data).map(([id, post]) => ({
          id,
          ...post,
        }));
        setPosts(postsList);
      } else {
        setPosts([]);
      }
    });
  }, []);

  const handlePostChange = (event) => {
    setNewPost(event.target.value);
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setNewImage(event.target.files[0]);
    }
  };

  const handlePostSubmit = (event) => {
    event.preventDefault();

    if (newPost.trim() !== '' || newImage) {
      const post = {
        content: newPost,
        likes: 0,
        dislikes: 0,
      };

      const postsRef = ref(database, 'posts');
      const newPostRef = push(postsRef);
      const postId = newPostRef.key;

      if (newImage) {
        const imageRef = storageRef(storage, `images/${postId}`);
        uploadBytes(imageRef, newImage).then(() => {
          getDownloadURL(imageRef).then((url) => {
            post.imageURL = url;
            set(newPostRef, post);
            setNewImage(null);
            setNewPost('');
          });
        });
      } else {
        set(newPostRef, post);
        setNewPost('');
      }
    }
  };

  const handleLike = (postId) => {
    const postRef = ref(database, `posts/${postId}/likes`);
    set(postRef, posts.find((post) => post.id === postId).likes + 1);
  };

  const handleDislike = (postId) => {
    const postRef = ref(database, `posts/${postId}/dislikes`);
    set(postRef, posts.find((post) => post.id === postId).dislikes + 1);
  };

  return (
    <div className="App">
      <h1>Create a Post</h1>
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={newPost}
          onChange={handlePostChange}
          placeholder="Write your post..."
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Post</button>
      </form>
      <h2>Posts</h2>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {post.imageURL && <img src={post.imageURL} alt="Post" />}
              <p>{post.content}</p>
              <button onClick={() => handleLike(post.id)}>Like</button>
              <span>{post.likes}</span>
              <button onClick={() => handleDislike(post.id)}>Dislike</button>
              <span>{post.dislikes}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts yet.</p>
      )}
    </div>
  );
};

export default App;
