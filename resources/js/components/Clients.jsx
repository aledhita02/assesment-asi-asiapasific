import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const response = await axios.get('/api/clients');
        setClients(response.data);
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (key !== 'client_logo') {
                formData.append(key, data[key]);
            }
        });

        if (data.client_logo && data.client_logo[0]) {
            formData.append('client_logo', data.client_logo[0]);
        }

        if (editingId) {
            await axios.post(`/api/clients/${editingId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            await axios.post('/api/clients', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        resetForm();
        fetchClients();
    };

    const resetForm = () => {
        reset();
        setEditingId(null);
        setLogoPreview(null);
    };

    const handleEdit = (client) => {
        setEditingId(client.id);
        Object.keys(client).forEach(key => {
            setValue(key, client[key]);
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            await axios.delete(`/api/clients/${id}`);
            fetchClients();
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Client Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        {editingId ? 'Edit Client' : 'Add New Client'}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block">Name</label>
                            <input
                                {...register('name')}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block">Is Project</label>
                            <select
                                {...register('is_project')}
                                className="w-full p-2 border rounded"
                                defaultValue="0"
                            >
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>

                        <div>
                            <label className="block">Self Capture</label>
                            <select
                                {...register('self_capture')}
                                className="w-full p-2 border rounded"
                                defaultValue="1"
                            >
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>

                        <div>
                            <label className="block">Client Prefix</label>
                            <input
                                {...register('client_prefix')}
                                className="w-full p-2 border rounded"
                                maxLength="4"
                                required
                            />
                        </div>

                        <div>
                            <label className="block">Client Logo</label>
                            <input
                                type="file"
                                {...register('client_logo')}
                                onChange={handleLogoChange}
                                className="w-full p-2 border rounded"
                                accept="image/*"
                            />
                            {logoPreview && (
                                <img src={logoPreview} alt="Preview" className="mt-2 h-20" />
                            )}
                        </div>

                        <div>
                            <label className="block">Address</label>
                            <textarea
                                {...register('address')}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block">Phone Number</label>
                            <input
                                {...register('phone_number')}
                                className="w-full p-2 border rounded"
                                type="tel"
                            />
                        </div>

                        <div>
                            <label className="block">City</label>
                            <input
                                {...register('city')}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                {editingId ? 'Update' : 'Save'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Client List</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border">Name</th>
                                    <th className="py-2 px-4 border">Prefix</th>
                                    <th className="py-2 px-4 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => (
                                    <tr key={client.id}>
                                        <td className="py-2 px-4 border">{client.name}</td>
                                        <td className="py-2 px-4 border">{client.client_prefix}</td>
                                        <td className="py-2 px-4 border">
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clients;
