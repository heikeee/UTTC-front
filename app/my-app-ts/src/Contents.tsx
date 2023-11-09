import React, { useState, useEffect, SyntheticEvent } from 'react';

type User = {
    id: string
    name: string
    url: string
    category: string
    content: string
}

function Contents() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [sortAscending, setSortAscending] = useState(true); // 追加: ソート順

    // サーバーからユーザー一覧を取得する関数
    const fetchUsers = async () => {
        try {
            const response = await fetch(
                'https://utter-front-upqs344voq-uc.a.run.app/user',
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const data: User[] = await response.json();

            // ソート
            data.sort((a, b) => {
                if (sortAscending) {
                    return a.category.localeCompare(b.category);
                } else {
                    return b.category.localeCompare(a.category);
                }
            });

            setUsers(data);
        } catch (error) {
            console.log(error);
        }
    };

    // アプリの初期化時にユーザー一覧を取得
    useEffect(() => {
        fetchUsers();
    }, []);

    // フォームを送信して新しいユーザーをサーバーに保存する関数
    const handleSubmit = async (e: SyntheticEvent) => {
        // ... 以前のコード ...

        try {
            const response = await fetch('https://utter-front-upqs344voq-uc.a.run.app/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, url, category, content }),
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            // フォームをクリアしてユーザー一覧を更新
            setName('');
            setCategory('');
            setUrl('');
            setContent('');
            setErrorMessage('');
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage('Failed to create user');
        }
    };

    // ソート順を切り替える関数
    const toggleSort = () => {
        setSortAscending(!sortAscending);
        // ユーザーを再度ソート
        fetchUsers();
    };

    return (
        <div className="App">
            <h1>Sannkou List</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={toggleSort}>
                {sortAscending ? 'Sort Descending' : 'Sort Ascending'}
            </button>
            <ul>
                {users.map((user: User) => (
                    <li key={user.id}>
                        {user.id}, {user.name}, {user.category}, {user.url}, {user.content}
                    </li>
                ))}
            </ul>
            <h2>Add New</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button type="submit">Add</button>
            </form>
        </div>
    );
}

export default Contents;
