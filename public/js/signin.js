import { callMyServer, showSelector } from "./utils.js"

export const refreshSignInStatus = async function() {
    const userInfoObj = await callMyServer("/server/users/get_my_info");
    const userInfo = userInfoObj.userInfo;
    if (userInfo == null) {
        showSelector("#notSignedIn");
    }
}