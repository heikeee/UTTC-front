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
    const [selectedCategory, setSelectedCategory] = useState('');
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [sortAscending, setSortAscending] = useState(true);

    const categories = ['book', 'movie', 'vlog'];

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

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

    useEffect(() => {
        fetchUsers();
    }, [sortAscending, selectedCategory]);

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!name || !selectedCategory || !url || !content) {
            setErrorMessage('Name, category, url, and content are required');
            return;
        }

        if (!name) {
            setErrorMessage('Please enter name');
            return;
        }

        if (name.length > 50) {
            setErrorMessage('Please enter a name shorter than 50 characters');
            return;
        }

        try {
            const response = await fetch('https://utter-front-upqs344voq-uc.a.run.app/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, url, category: selectedCategory, content }),
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            setName('');
            setSelectedCategory('');
            setUrl('');
            setContent('');
            setErrorMessage('');
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage('Failed to create user');
        }
    };

    const toggleSort = () => {
        setSortAscending(!sortAscending);
    };

    return (
        <div className="App">
            <h1>Sannkou List</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={toggleSort}>
                {sortAscending ? 'Sort Ascending' : 'Sort Descending'}
            </button>
            <ul>
                {users.map((user: User) => (
                    <li key={user.id}>
                        {user.name}, {user.category}, {user.url}, {user.content}
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
                <div>
                    {categories.map((category) => (
                        <label key={category}>
                            <input
                                type="radio"
                                value={category}
                                checked={selectedCategory === category}
                                onChange={() => setSelectedCategory(category)}
                            />
                            {category}
                        </label>
                    ))}
                </div>
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

/*
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
}
const data:User[] = await response.json();
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
console.log(users)
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
body: JSON.stringify({ name:name, url:url, category:category, content:content }),
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

return (
<div className="App">
<h1>Sannkou List</h1>
{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
<ul>
{users.map((user: User) => (
    <li key={user.id}>
        {user.id},{user.name},{user.category},{user.url},{user.content}
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
<button type="submit">Add </button>
</form>
</div>
);
}
export default Contents;
*/