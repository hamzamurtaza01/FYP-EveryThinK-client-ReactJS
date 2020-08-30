const INITIAL_STATE = {
    user: '',
};

const reducer = (state = INITIAL_STATE, action) => { // state ko empty object bhi rakh sakte hain
    switch (action.type) {
        case "UPDATE_USER": {
            return { ...state, user: action.user }
        }
        case "REMOVE_USER": {
            return { ...state, user: null }
        }
        default: {
            return state;
        }
    }
}

export default reducer;