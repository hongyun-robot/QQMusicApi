const jsonFile = require('jsonfile');

module.exports = () => {
  let allCookies = {};
  let userCookie = {};

  const getAllCookies = () => {
    try {
      allCookies = jsonFile.readFileSync('data/allCookies.json')
    } catch (err) {
      // get allCookies failed
    }
  }

  const getUserCookie = () => {
    try {
      userCookie = jsonFile.readFileSync('data/cookie.json')
    } catch (err) {
      // get cookie failed
    }
  }

  getAllCookies();
  getUserCookie();

  return {
    allCookies: () => allCookies,
    userCookie: () => userCookie,
    refreshAllCookies: getAllCookies,
    refreshUserCookie: getUserCookie,
    updateAllCookies: (v) => allCookies = v,
    updateUserCookie: (v) => userCookie = v,
  }
}