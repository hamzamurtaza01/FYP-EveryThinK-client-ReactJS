const updateUserInfo = (user_info) => {
    return {
        type: 'UPDATE_USER_INFO',
        user_info
    }
}

const removeUserInfo = () => {
    return {
        type: 'REMOVE_USER_INFO'
    }
}

export { updateUserInfo, removeUserInfo };