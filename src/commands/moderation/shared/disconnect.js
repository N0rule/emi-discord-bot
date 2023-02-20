const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.tag} отключен с голосового канала`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для отключения ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для отключения ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} не в голосовом канале`;
  }
  return `Ошибка отключения ${target.user.tag}`;
};
