/*
 * @Author: Shaoli
 * @Date: 2023-06-24 11:20:02
 * @LastEditors: Shaoli
 * @LastEditTime: 2023-06-24 21:35:32
 * @Description: 请填写文件描述
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import {HashRouter} from "react-router-dom";
ReactDOM.createRoot(document.getElementById('root')).render(
    <HashRouter>
        <App/>
    </HashRouter>,
)
