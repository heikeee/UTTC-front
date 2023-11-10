import React, { useState, useEffect, SyntheticEvent } from 'react';
import {ulid} from 'ulid';

type User = {
    id: string
    name: string
    url: string
    category: string
    content: string
    chapter: string
    newId: string
}

function Contents() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [newId, setNewId] = useState('');
    const [url, setUrl] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [sortAscendingid, setSortAscendingid] = useState(true);
    const [sortAscendingnewId, setSortAscendingnewId] = useState(true);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [newChapter, setNewChapter] = useState(''); // 追加: 新しい章の入力
    const [newCategory, setNewCategory] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
                     if (sortAscendingid) {
                         return a.id.localeCompare(b.id);
                     } else {
                         return b.id.localeCompare(a.id);
                     }
                 })

                .sort((c, d) => {
                    if (sortAscendingnewId) {
                        return c.newId.localeCompare(d.newId);
                    } else {
                        return c.newId.localeCompare(d.newId);
                    }
                });


            setUsers(filteredAndSortedData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [sortAscendingnewId,sortAscendingid,selectedCategory, selectedChapter]);
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

    const handleEditUser = (userId: string) => {
        const selectedUser = users.find((user) => user.id === userId);

        if (selectedUser) {
            setSelectedUserId(userId);
            setName(selectedUser.name);
            setUrl(selectedUser.url);
            setNewCategory(selectedUser.category);
            setContent(selectedUser.content);
            setNewChapter(selectedUser.chapter);
            const newUlid = ulid();
            setNewId(newUlid);
        }
    };


    const handleUpdateUser = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault()
        console.log(selectedUserId)
        console.log(name)
        console.log(url)
        console.log(newCategory)
        console.log(content)
        console.log(newChapter)
        try {
            if (!selectedUserId) {
                throw new Error('No user selected for update');
            }

            console.log("PUT")

            const response = await fetch(`https://utter-front-upqs344voq-uc.a.run.app/user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedUserId,
                    name: name,
                    url: url,
                    category: newCategory,
                    content: content,
                    chapter: newChapter,
                    newId:newId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            setErrorMessage('');
            setSelectedUserId(null);
            console.log("updated")
            await fetchUsers(); // ユーザーの再取得
        } catch (error) {
            console.error('Error updating user:', error);
            setErrorMessage('Failed to update user');
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

    const toggleSortid = () => {
        setSortAscendingid(!sortAscendingid);
    };

    const toggleSortnewId = () => {
        setSortAscendingnewId(!sortAscendingnewId);
    };



    return (
        <div className="App">
            <h1>Sannkou List</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={toggleSortid}>
                {sortAscendingid ? 'date Sort Ascending' : 'date Sort Descending'}
            </button>
            <button onClick={toggleSortnewId}>
                {sortAscendingnewId ? 'edit date Sort Ascending' : 'edit date Sort Descending'}
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
                        <button onClick={() => handleEditUser(user.id)}>Edit</button>
                        <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            {selectedUserId && (
                <div>
                    <h2>Edit User</h2>
                    <form onSubmit={(e)=>handleUpdateUser(e)}>
                        <label>
                            Name:
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            Url:
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            Category:
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            Content:
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            Chapter:
                            <input
                                type="text"
                                value={newChapter}
                                onChange={(e) => setNewChapter(e.target.value)}
                            />
                        </label>
                        <br />
                        <button type="submit">Update</button>
                    </form>
                </div>
            )}
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

