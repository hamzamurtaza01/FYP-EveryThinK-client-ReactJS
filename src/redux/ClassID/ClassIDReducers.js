const INITIAL_STATE = {
    ClassId: '',
};

const reducer = (state = INITIAL_STATE, action) => { // state ko empty object bhi rakh sakte hain
    switch (action.type) {
        case "UPDATE_ClassId": {
            return { ...state, ClassId: action.ClassId }
        }
        case "REMOVE_ClassId": {
            return { ...state, ClassId: null }
        }
        default: {
            return state;
        }
    }
}

export default reducer;