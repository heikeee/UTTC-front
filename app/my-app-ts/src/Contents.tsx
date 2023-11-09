import React, { useState, useEffect, SyntheticEvent } from 'react';

type User = {
    id: string
    name: string
    url: string
    category: string
    content: string
    chapter: string
}

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
    const [newChapter, setNewChapter] = useState(''); // 追加: 新しい章の入力
    const [newCategory, setNewCategory] = useState('');


    const categories = ['book', 'movie', 'blog'];
    const chapters = ['chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6', 'chapter7'];

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    const handleChapterSelect = (chapter: string) => {
        setSelectedChapter(chapter);
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

            const filteredAndSortedData = data
                .filter(user => (!selectedCategory || user.category === selectedCategory) && (!selectedChapter || user.chapter === selectedChapter))
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
    }, [sortAscendingCategory,selectedCategory, selectedChapter]);
// [ sortAscendingCategory,selectedCategory, selectedChapter]);

    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`https://utter-front-upqs344voq-uc.a.run.app/user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to delete user raiki sakaguti');
            }

            fetchUsers(); // ユーザーの再取得
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorMessage('Failed to delete user');
        }
    };

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!chapters.includes(newChapter)){
            setErrorMessage('Invalid chapter selected');
            return;
        }
        if (!categories.includes(newCategory)){
            setErrorMessage('Invalid category selected');
            return;
        }

        if (!name || !newCategory || !url || !content || !newChapter) { // 新しい章のバリデーション追加
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
                body: JSON.stringify({ name, url, category: newCategory, content, chapter: newChapter }), // 新しい章をリクエストに含める
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            setName('');
            setNewCategory('');
            setUrl('');
            setContent('');
            setSelectedChapter('');
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
            {/*<div>*/}
            {/*    {categories.map((category) => (*/}
            {/*        <label key={category}>*/}
            {/*            <input*/}
            {/*                key={category}*/}
            {/*                checked={selectedCategory === category}*/}
            {/*                onChange={() => handleCategorySelect(category)}*/}
            {/*                style={selectedCategory === category ? { fontWeight: 'bold' } : {}}*/}
            {/*            />*/}
            {/*            {category}*/}
            {/*        </label>*/}
            {/*    ))}*/}
            {/*</div>*/}
            <div>
                {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            style={selectedCategory === category ? { fontWeight: 'bold' } : {}}
                        >
                            {category}
                        </button>

                ))}
            </div>
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
                        <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
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
                    placeholder="Url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Chapter"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                />
                <button type="submit">Add</button>
            </form>
        </div>
    );
}

export default Contents;

