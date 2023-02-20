const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `Звук ${target.user.tag} отключен на этом сервере`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для откл.звук ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для откл.звук ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} не в голосовом канале`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `Звук ${target.user.tag} уже отключен`;
  }
  return `Ошибка откл.звука для ${target.user.tag}`;
};
