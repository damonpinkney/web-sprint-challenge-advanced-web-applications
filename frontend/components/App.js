import React, { useState, useCallback } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import Articles from './Articles';
import LoginForm from './LoginForm';
import Message from './Message';
import ArticleForm from './ArticleForm';
import Spinner from './Spinner';

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [spinnerOn, setSpinnerOn] = useState(false);

  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate('/');
  };

  const redirectToArticles = () => {
    navigate('/articles');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  };

  const login = ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
  
    fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setMessage(`Here are your articles, ${username}!`);
          redirectToArticles();
        } else {
          throw new Error('Invalid response from server');
        }
      })
      .catch(error => {
        setMessage('Login failed');
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const getArticles = useCallback(() => {
    setMessage('');
    setSpinnerOn(true);
    fetch(articlesUrl, {
      headers: { Authorization: localStorage.getItem('token') },
    })
      .then(res => {
        if (res.status === 401) {
          redirectToLogin();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        setArticles(data);
        setSpinnerOn(false);
      })
      .catch((error) => {
        if (error.message !== 'Unauthorized') {
          setMessage('Failed to fetch articles');
        }
        setSpinnerOn(false);
      });
  }, []);

  const postArticle = article => {
    setMessage('');
    setSpinnerOn(true);
    fetch(articlesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(article),
    })
      .then(res => res.json())
      .then(data => {
        setArticles([...articles, data.article]);
        setMessage(data.message);
        setSpinnerOn(false);
      })
      .catch(() => {
        setMessage('Failed to post article');
        setSpinnerOn(false);
      });
  };

  const updateArticle = ({ article_id, article }) => {
    setMessage('');
    setSpinnerOn(true);
    fetch(`${articlesUrl}/${article_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(article),
    })
      .then(res => res.json())
      .then(data => {
        setArticles(
          articles.map(art =>
            art.article_id === article_id ? data.article : art
          )
        );
        setMessage(data.message);
        setSpinnerOn(false);
      })
      .catch(() => {
        setMessage('Failed to update article');
        setSpinnerOn(false);
      });
  };

  const deleteArticle = article_id => {
    setMessage('');
    setSpinnerOn(true);
    fetch(`${articlesUrl}/${article_id}`, {
      method: 'DELETE',
      headers: { Authorization: localStorage.getItem('token') },
    })
      .then(res => res.json())
      .then(data => {
        setArticles(articles.filter(art => art.article_id !== article_id));
        setMessage(data.message);
        setSpinnerOn(false);
      })
      .catch(() => {
        setMessage('Failed to delete article');
        setSpinnerOn(false);
      });
  };

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>
        Logout from app
      </button>
      <div id="wrapper" style={{ opacity: spinnerOn ? '0.25' : '1' }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">
            Login
          </NavLink>
          <NavLink id="articlesScreen" to="/articles">
            Articles
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route
            path="articles"
            element={
              <>
                <ArticleForm
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  currentArticleId={currentArticleId}
                  setCurrentArticleId={setCurrentArticleId}
                  articles={articles}
                />
                <Articles
                  articles={articles}
                  getArticles={getArticles}
                  deleteArticle={deleteArticle}
                  setCurrentArticleId={setCurrentArticleId}
                />
              </>
            }
          />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
