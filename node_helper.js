const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    Log.log("node_helper.js started.");

  },

  socketNotificationReceived(notification, payload) {
    Log.log(notification);
  },


})