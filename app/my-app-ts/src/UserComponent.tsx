import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';

interface UserData {
    id: string;
    name: string;
    url: string;
    category: string;
}

function UserComponent() {
    const [userData, setUserData] = useState<UserData[]>([]);
    const [newUserData, setNewUserData] = useState<{ name: string; url: string; category: string }>({
        name: '',
        url: '',
        category: '',
    });

    useEffect(() => {
        // ユーザーデータを取得する関数
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/user');
                setUserData(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateUserData = async () => {
        try {
            const response = await axios.post('/user', newUserData);
            const updatedUserData = response.data;
            setUserData([...userData, updatedUserData]);
            setNewUserData({ name: '', url: '', category: '' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <div>
            <h2>User Data</h2>
            <ul>
                {userData.map((user) => (
                    <li key={user.id}>
                        {user.name}, {user.url}, {user.category}
                    </li>
                ))}
            </ul>
            <div>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={newUserData.name}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="url"
                    placeholder="URL"
                    value={newUserData.url}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={newUserData.category}
                    onChange={handleInputChange}
                />
                <button onClick={handleUpdateUserData}>Add User</button>
            </div>
        </div>
    );
}

export default UserComponent;
