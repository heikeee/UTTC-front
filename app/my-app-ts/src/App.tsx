import React from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './Loginform';
import Contents from './Contents';
import { onAuthStateChanged } from "firebase/auth";
import { fireAuth } from "./firebase";
import {useState} from "react";
import UserComponent from './UserComponent';

const App = () => {
    // stateとしてログイン状態を管理する。ログインしていないときはnullになる。
    const [loginUser, setLoginUser] = useState(fireAuth.currentUser);

    // ログイン状態を監視して、stateをリアルタイムで更新する
    onAuthStateChanged(fireAuth, user => {
        setLoginUser(user);
    });

    return (
        <>
            <LoginForm />
            {/* ログインしていないと見られないコンテンツは、loginUserがnullの場合表示しない */}
            {loginUser ? <Contents /> : null}
            {/*{loginUser ? <UserComponent /> :null}*/}
        </>
    );
};

export default App;