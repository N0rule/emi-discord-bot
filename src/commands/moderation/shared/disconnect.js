const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} отключен с голосового канала`;
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
  return `Ошибка отключения ${target.user.username}`;
};
