const INITIAL_STATE = {
    info: '',
};

const reducer = (state = INITIAL_STATE, action) => { // state ko empty object bhi rakh sakte hain
    switch (action.type) {
        case "UPDATE_USER_INFO": {
            return { ...state, info: action.user_info }
        }
        case "REMOVE_USER_INFO": {
            return { ...state, info: null }
        }
        default: {
            return state;
        }
    }
}

export default reducer;