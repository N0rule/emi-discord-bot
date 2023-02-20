const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `Голос ${target.user.tag} отключен на этом сервере`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для мута ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для мута ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} не в голосовом канале`;
  }
  if (response === "ALREADY_MUTED") {
    return `${target.user.tag} уже замьючен`;
  }
  return `Ошибка голосового мута для ${target.user.tag}`;
};
