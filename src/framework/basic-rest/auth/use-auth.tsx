import { useState, useEffect } from 'react';
import { clearAuthSession, getToken, hasSessionHint } from '@framework/utils/get-token';
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
                clearAuthSession();
            } finally {
                setLoading(false);
            }
        };
        // Điều kiện là "có phiên", không phải "có token": token ở bộ nhớ nên sau
        // reload nó rỗng trong khi phiên vẫn sống — hỏi cookie access token như
        // bản cũ thì người đang đăng nhập bị coi là khách. `me()` đi qua `http`
        // nên interceptor tự refresh trước khi gọi.
        if (getToken() || hasSessionHint()) fetchUser();
        else setLoading(false);
    }, []);
    return { user, loading };
};