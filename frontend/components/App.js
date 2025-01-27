import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
    const [message, setMessage] = useState('')
    const [articles, setArticles] = useState([])
    const [currentArticleId, setCurrentArticleId] = useState()
    const [spinnerOn, setSpinnerOn] = useState(false)

    const navigate = useNavigate()
    const redirectToLogin = () => { navigate('/') }
    const redirectToArticles = () => { navigate('articles') }

    const logout = () => {
        if (localStorage.getItem('token')) {
            localStorage.removeItem('token')
            setMessage("Goodbye!")
        }
        redirectToLogin()
    }

    const login = ({ username, password }) => {
        setMessage('')
        setSpinnerOn(true)
        axios.post(loginUrl, { username, password })
            .then(({ data: { message: servMsg, token } }) => {
                localStorage.setItem('token', token)
                setMessage(servMsg)
                redirectToArticles()
            })
            .catch(err => {
                setMessage("Something went wrong")
                console.error(err)
            })
            .finally(() => setSpinnerOn(false))
    }

    const getArticles = () => {
        setMessage('')
        setSpinnerOn(true)
        const token = localStorage.getItem('token')
        if (!token) {
            redirectToLogin()
        } else {
            axios.get(articlesUrl,
                { headers: { Authorization: token } }
            )
                .then(({ data: { message: servMsg, articles: servArticles } }) => {
                    setMessage(servMsg)
                    setArticles(servArticles)
                })
                .catch(err => {
                    setMessage(err.response.data.message)
                    console.error(err)
                    if (err.status == 401) redirectToLogin()
                })
                .finally(() => setSpinnerOn(false))
        }
    }

    const postArticle = article => {
        setMessage('')
        setSpinnerOn(true)
        const token = localStorage.getItem('token')
        if (!token) {
            redirectToLogin()
        } else {
            axios.post(articlesUrl,
                article,
                { headers: { Authorization: token } }
            )
                .then(({ data: { message: servMsg, article } }) => {
                    setMessage(servMsg)
                    setArticles([...articles, article])
                })
                .catch(err => {
                    setMessage(err.response.data.message)
                    console.error(err)
                    if (err.status == 401) redirectToLogin()
                })
                .finally(() => setSpinnerOn(false))
        }
    }

    const updateArticle = (article_id, article) => {
        setMessage('')
        setSpinnerOn(true)
        const token = localStorage.getItem('token')
        if (!token) {
            redirectToLogin()
        } else {
            axios.put(`${articlesUrl}/${article_id}`,
                article,
                { headers: { Authorization: token } }
            )
                .then(({ data: { message: servMsg, article } }) => {
                    setMessage(servMsg)
                    const newArticles = articles.map(art => {
                        if (art.article_id == article_id) {
                            return { ...art, ...article }
                        } else {
                            return art
                        }
                    })
                    setArticles(newArticles)
                })
                .catch(err => {
                    setMessage(err.response.data.message)
                    console.error(err)
                    if (err.status == 401) redirectToLogin()
                })
                .finally(() => setSpinnerOn(false))
        }
    }

    const deleteArticle = article_id => {
        setMessage('')
        setSpinnerOn(true)
        const token = localStorage.getItem('token')
        if (!token) {
            redirectToLogin()
        } else {
            axios.delete(`${articlesUrl}/${article_id}`,
                { headers: { Authorization: token } }
            )
                .then(({ data: { message: servMsg } }) => {
                    setMessage(servMsg)
                    const newArticles = articles.filter(art => art.article_id != article_id)
                    setArticles(newArticles)
                })
                .catch(err => {
                    setMessage(err.response.data.message)
                    console.error(err)
                    if (err.status == 401) redirectToLogin()
                })
                .finally(() => setSpinnerOn(false))
        }
    }

    return (
        <>
            <Spinner on={spinnerOn} />
            <Message message={message} />
            <button id="logout" onClick={logout}>Logout from app</button>
            <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
                <h1>Advanced Web Applications</h1>
                <nav>
                    <NavLink id="loginScreen" to="/">Login</NavLink>
                    <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
                </nav>
                <Routes>
                    <Route path="/" element={<LoginForm login={login} />} />
                    <Route path="articles/*" element={
                        <>
                            <ArticleForm
                                articles={articles}
                                postArticle={postArticle}
                                updateArticle={updateArticle}
                                currentArticleId={currentArticleId}
                                setCurrentArticleId={setCurrentArticleId}
                            />
                            <Articles
                                articles={articles}
                                getArticles={getArticles}
                                deleteArticle={deleteArticle}
                                currentArticleId={currentArticleId}
                                setCurrentArticleId={setCurrentArticleId}
                            />
                        </>
                    } />
                </Routes>
                <footer>Bloom Institute of Technology 2024</footer>
            </div>
        </>
    )
}