import React, { createContext, useContext } from "react";
import { useLocalStorage } from "react-use";
import { userReducer, initialUserState, UserState, UserAction } from "./user.reducer";

interface UserContextProps {
    state: UserState;
    saveUserItem: (user: UserState) => void;
    dispatch: React.Dispatch<UserAction>;
}

// Tạo context
const userContext = createContext<UserContextProps | undefined>(undefined);

userContext.displayName = "UserContext"
// Tạo Provider
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [saveUser, setSaveUser] = useLocalStorage(
        "dynamic-user",
        JSON.stringify(initialUserState)
    )

    const [state, dispatch] = React.useReducer(userReducer, JSON.parse(saveUser!));
    // Lưu thông tin người dùng vào localStorage mỗi khi trạng thái thay đổi
    React.useEffect(() => {
        setSaveUser(JSON.stringify(state))
    }, [state, setSaveUser]);
    const saveUserItem = (user: UserState) =>
        dispatch({ type: "SET_USER", payload: user });
    const value = React.useMemo(
        () => ({
            state,
            dispatch,
            saveUserItem,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state, dispatch]
    );
    return <userContext.Provider value={value} >{children}</userContext.Provider>;
};

// Custom hook để sử dụng context
export const useUser = () => {
    const context = useContext(userContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};