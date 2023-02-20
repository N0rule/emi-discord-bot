const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `Голос ${target.user.username} включен на этом сервере`;
  }
  if (response === "MEMBER_PERM") {
    return `У тебя нет прав для анмута ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `У меня нет прав для анмута ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} не в голосовом канале`;
  }
  if (response === "NOT_MUTED") {
    return `${target.user.username} не замьючен`;
  }
  return `Ошибка голосового анмута для ${target.user.username}`;
};
