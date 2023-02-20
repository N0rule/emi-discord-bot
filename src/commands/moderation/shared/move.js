const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `Звук ${target.user.username} отключен на этом сервере`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для отключения ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для отключения ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} не в голосовом канале`;
  }
  if (response === "TARGET_PERM") {
    return `${target.user.username} не имеет прав для подключения в ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `${target.user.username} уже подключен к ${channel}`;
  }
  return `Ошибка передвижения ${target.user.username} в ${channel}`;
};
