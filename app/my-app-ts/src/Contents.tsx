import React, { useState, useEffect, SyntheticEvent } from 'react';

type User = {
    id: string;
    name: string;
    url: string;
    category: string;
    content: string;
    chapter: string;
};

function Contents() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [sortAscendingCategory, setSortAscendingCategory] = useState(true);
    const [sortAscendingChapter, setSortAscendingChapter] = useState(true);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [newCategory, setNewCategory] = useState(''); // 新しいカテゴリの入力
    const [newChapter, setNewChapter] = useState(''); // 新しい章の入力

    const categories = ['book', 'movie', 'vlog'];
    const chapters = ['chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6', 'chapter7'];

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    const handleChapterSelect = (chapter: string) => {
        setSelectedChapter(chapter);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://utter-front-upqs344voq-uc.a.run.app/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data: User[] = await response.json();

            const filteredAndSortedData = data
                .filter((user) => (!selectedCategory || user.category === selectedCategory) && (!selectedChapter || user.chapter === selectedChapter))
                .sort((a, b) => {
                    if (sortAscendingCategory) {
                        return a.category.localeCompare(b.category);
                    } else {
                        return b.category.localeCompare(a.category);
                    }
                });

            setUsers(filteredAndSortedData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [sortAscendingCategory, selectedCategory, selectedChapter]);

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!name || !newCategory || !url || !content || !newChapter) {
            // 新しいカテゴリと新しい章のバリデーション追加
            setErrorMessage('Name, category, url, content, and chapter are required');
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
                body: JSON.stringify({ name, url, category: newCategory, content, chapter: newChapter }), // 新しいカテゴリと新しい章をリクエストに含める
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            setName('');
            setNewCategory('');
            setUrl('');
            setContent('');
            setNewChapter('');
            setErrorMessage('');
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage('Failed to create user');
        }
    };

    const toggleSortCategory = () => {
        setSortAscendingCategory(!sortAscendingCategory);
    };

    const toggleSortChapter = () => {
        setSortAscendingChapter(!sortAscendingChapter);
    };

    return (
        <div className="App">
            <h1>Sannkou List</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={toggleSortCategory}>
                {sortAscendingCategory ? 'Category Sort Ascending' : 'Category Sort Descending'}
            </button>
            <button onClick={toggleSortChapter}>
                {sortAscendingChapter ? 'Chapter Sort Ascending' : 'Chapter Sort Descending'}
            </button>
            <div>
                {chapters.map((chapter) => (
                    <button
                        key={chapter}
                        onClick={() => handleChapterSelect(chapter)}
                        style={selectedChapter === chapter ? { fontWeight: 'bold' } : {}}
                    >
                        {chapter}
                    </button>
                ))}
            </div>
            <ul>
                {users.map((user: User) => (
                    <li key={user.id}>
                        {user.chapter}, {user.name}, {user.category}, {user.url}, {user.content}
                    </li>
                ))}
            </ul>
            <h2>Add New</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <div>
                    <input
                        type="text"
                        placeholder="New Category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </div>
                <input type="text" placeholder="Url" value={url} onChange={(e) => setUrl(e.target.value)} />
                <input type="text" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
                <div>
                    {chapters.map((chapter) => (
                        <label key={chapter}>
                            <input
                                type="radio"
                                value={chapter}
                                checked={selectedChapter === chapter}
                                onChange={() => setSelectedChapter(chapter)}
                            />
                            {chapter}
                        </label>
                    ))}
                </div>
                <button type="submit">Add</button>
            </form>
        </div>
    );
}

export default Contents;
