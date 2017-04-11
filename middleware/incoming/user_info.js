const addUserInfoToUpdate = {
  type: 'incoming',
  name: 'add-user-info-to-update',
  controller: (bot, update, next) => {
    if (bot.retrievesUserInfo) {
      return bot.getUserInfo(update.sender.id).then((userInfo) => {
        if (update.session.context) {
          update.session.context.userInfo = userInfo;
          update.session.context.firstname = userInfo.first_name;
          next();
        }
      });
    } else {
      next();
    }
  }
};

module.exports = {
  addUserInfoToUpdate
}
