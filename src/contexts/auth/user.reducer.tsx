export type UserState = {
    id: string | null,
    name: string | null,
    email: string | null,
    [key: string]: any
}
export type UserAction =
    | { type: 'SET_USER', payload: UserState }
    | { type: 'CLEAR_USER' }

export const initialUserState: UserState = {
    id: null,
    name: null,
    email: null,
};

export function userReducer(state: UserState, action: UserAction): UserState {
    switch (action.type) {
        case "SET_USER":
            return {
                ...state,
                ...action.payload
            }
        case "CLEAR_USER":
            return {
                ...state,
                user: null
            }
        default:
            return state
    }
}