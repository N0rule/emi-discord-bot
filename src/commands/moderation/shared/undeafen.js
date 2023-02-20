const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `Звук ${target.user.tag} включен на этом сервере`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для вкл.звук ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для вкл.звук ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} не в голосовом канале`;
  }
  if (response === "NOT_DEAFENED") {
    return `Звук ${target.user.tag} уже включен`;
  }
  return `Ошибка вкл.звука для ${target.user.tag}`;
};
