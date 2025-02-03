import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { me } from './use-login';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await me();
                setUser(data);
            } catch (error) {
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
            } finally {
                setLoading(false);
            }
        };
        const token = Cookies.get('access_token');
        if (token) fetchUser();
        else setLoading(false);
    }, []);
    return { user, loading };
};