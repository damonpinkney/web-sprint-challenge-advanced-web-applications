import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function Articles({
  articles,
  getArticles,
  deleteArticle,
  setCurrentArticleId,
}) {
  useEffect(() => {
    getArticles();
  }, [getArticles]);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/" />;
  }

  return (
    <div id="articles">
      <h2>Articles</h2>
      {articles.length === 0 ? (
        'No articles yet'
      ) : (
        articles.map(article => (
          <div className="article" key={article.article_id}>
            <div>
              <h3>{article.title}</h3>
              <p>{article.text}</p>
              <p>Topic: {article.topic}</p>
            </div>
            <div>
              <button onClick={() => setCurrentArticleId(article.article_id)}>
                Edit
              </button>
              <button onClick={() => deleteArticle(article.article_id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
