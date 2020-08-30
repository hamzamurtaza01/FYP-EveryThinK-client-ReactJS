import { db } from '../firebase/firebase';

// User API
export const doCreateUser = (id, username, email) => {
    db.ref(`Users/${id}`).set({
        username, email
    });
}

export const onceGetAllUsers = () => {
    db.ref('Users').once('value', function (users) {
        users.forEach(user => {
            console.log(user.val());
            // users.val() contains object of an individual user
        })
    });
}


// Other Entity APIs ....
