const INITIAL_STATE = {
    RecieverId: '',
};

const reducer = (state = INITIAL_STATE, action) => { // state ko empty object bhi rakh sakte hain
    switch (action.type) {
        case "UPDATE_RecieverId": {
            return { ...state, RecieverId: action.RecieverId }
        }
        case "REMOVE_RecieverId": {
            return { ...state, RecieverId: null }
        }
        default: {
            return state;
        }
    }
}

export default reducer;