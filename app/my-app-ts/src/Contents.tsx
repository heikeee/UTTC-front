import React, { useState, useEffect, SyntheticEvent } from 'react';

type User = {
    id: string
    name: string
    url: string
    category: string
}

function Contents() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
            /*if (!response.ok) {
                throw new Error('Failed to fetch users');
            }*/
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            // console.error('Error fetching users:', error);
            // setErrorMessage('Failed to fetch users');
            console.log(error)
        }
    };

    // アプリの初期化時にユーザー一覧を取得
    useEffect(() => {
        fetchUsers();
    }, []);

    // フォームを送信して新しいユーザーをサーバーに保存する関数
    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        // バリデーション
        if (!name || !category || !url) {
            setErrorMessage('Name and age are required');
            return;
        }

        if (!name) {
            alert("Please enter name");
            return;
        }

        if (name.length > 50) {
            alert("Please enter a name shorter than 50 characters");
            return;
        }


        try {
            const response = await fetch('https://utter-front-upqs344voq-uc.a.run.app/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name:name, url:url, category:category }),
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            // フォームをクリアしてユーザー一覧を更新
            setName('');
            setCategory('');
            setUrl('');
            setErrorMessage('');
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage('Failed to create user');
        }
    };

    return (
        <div className="App">
            <h1>User List</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <ul>
                {users.map((user: User) => (
                    <li key={user.id}>
                        {user.name}, {user.category} ,{user.url}
                    </li>
                ))}
            </ul>
            <h2>Add New User</h2>
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
                <button type="submit">Add </button>
            </form>
        </div>
    );
}
export default Contents;