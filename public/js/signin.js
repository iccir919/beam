import { callMyServer, showSelector, hideSelector } from "./utils.js"

/**
 * Methods to handle signing in and creating users. Because this is just
 * a personal project, I decided to skip the whole "creating a passowrd" thing
*/

export const createNewUser = async function () {
    const newUsername = document.querySelector("#username").value;
    await callMyServer("/server/user/create", true, {
        username: newUsername 
    });
    refreshSignInStatus();
}


/**
 * Get a list of all our users on the server
 */
export const getExistingUsers = async function() {
    const usersList = await callMyServer("/server/users/list");
    if (usersList.length === 0) {
        hideSelector("#existingUsers")
    }
}

export const refreshSignInStatus = async function() {
    const userInfoObj = await callMyServer("/server/users/get_my_info");
    const userInfo = userInfoObj.userInfo;
    if (userInfo == null) {
        showSelector("#notSignedIn");
        hideSelector("#signedIn");
        getExistingUsers();
    }
}