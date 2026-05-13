// 将时间制式转换为日期字符串
export function timeToDate(timestamp, type, mode) {
  // 时间戳模式
  const datePoint = mode
    ? Temporal.Instant.fromEpochMilliseconds(timestamp)
    : Temporal.Instant.from(timestamp); // TODO:Instant 平替 Date 对象，表示一个特定的时间点。但不是带时区的日期时间对象;fromEpochMilliseconds （毫秒）时间戳转换为时间点
  const date = datePoint.toZonedDateTimeISO(Temporal.Now.timeZoneId()); // TODO:转换为带时区的日期时间对象;获取当前时区的标识符
  // 是否只需要日期部分
  if (type === "date") return date.toPlainDate().toLocaleString(); // TODO:toPlainDate() 获取日期部分，返回一个 Temporal.PlainDate 对象;toString() 转换为字符串
  // 是否只需要时间部分
  if (type === "time") return date.toPlainTime().toLocaleString(); // TODO:toPlainTime() 获取时间部分，返回一个 Temporal.PlainTime 对象;toString() 转换为字符串
  return `${date.toPlainDate().toLocaleString()} ${date.toPlainTime().toLocaleString()}`; // TODO:toPlainDateTime() 获取日期和时间部分，返回一个 Temporal.PlainDateTime 对象;toString() 转换为字符串
}
