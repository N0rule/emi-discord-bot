const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `Звук ${target.user.username} отключен на этом сервере`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для откл.звук ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для откл.звук ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} не в голосовом канале`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `Звук ${target.user.username} уже отключен`;
  }
  return `Ошибка откл.звука для ${target.user.username}`;
};
