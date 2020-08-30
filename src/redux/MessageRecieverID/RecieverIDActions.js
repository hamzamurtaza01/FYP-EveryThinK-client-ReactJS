const updateRecieverId = (RecieverId) => {
    return {
        type: 'UPDATE_RecieverId',
        RecieverId
    }
}

const removeRecieverId = () => {
    return {
        type: 'REMOVE_RecieverId'
    }
}

export { updateRecieverId, removeRecieverId };