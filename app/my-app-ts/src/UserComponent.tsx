import React, { useState, useEffect, SyntheticEvent } from 'react';

type User = {
    id: string;
    name: string;
    url: string;
    category: string;
};

function UpdateUser() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // サーバーからユーザー一覧を取得する関数
    const fetchUsers = async () => {
        try {
            const response = await fetch('https://utter-front-upqs344voq-uc.a.run.app/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data: User[] = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setErrorMessage('Failed to fetch users');
        }
    };

    // アプリの初期化時にユーザー一覧を取得
    useEffect(() => {
        fetchUsers();
    }, []);

    // フォームを送信してユーザーを更新する関数
    const handleUpdateUser = async (e: SyntheticEvent) => {
        e.preventDefault();

        // バリデーション
        if (!selectedUserId || !name || !category || !url) {
            setErrorMessage('ID, Name, Category, and URL are required');
            return;
        }

        try {
            const response = await fetch(`https://utter-front-upqs344voq-uc.a.run.app/user/${selectedUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, url, category }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            // フォームをクリアしてユーザー一覧を更新
            setSelectedUserId(null);
            setName('');
            setCategory('');
            setUrl('');
            setErrorMessage('');
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            setErrorMessage('Failed to update user');
        }
    };

    return (
        <div className="App">
            <h1>Update User</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <ul>
                {users.map((user: User) => (
                    <li key={user.id}>
                        {user.id}, {user.name}, {user.category}, {user.url}
                        <button onClick={() => setSelectedUserId(user.id)}>Edit</button>
                    </li>
                ))}
            </ul>
            {selectedUserId && (
                <div>
                    <h2>Update User</h2>
                    <form onSubmit={handleUpdateUser}>
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
                        <button type="submit">Update</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UpdateUser;
