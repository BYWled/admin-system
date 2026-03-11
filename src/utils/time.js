export const timeToDate = (timestamp, type) => {
    const datePoint = Temporal.Instant.from(timestamp); // TODO:Instant 平替 Date 对象，表示一个特定的时间点。但不是带时区的日期时间对象
    const date = datePoint.toZonedDateTimeISO(Temporal.Now.timeZoneId()); // TODO:转换为带时区的日期时间对象;获取当前时区的标识符

    if (type === 'date') {
        return date.toPlainDate().toString(); // TODO:toPlainDate() 获取日期部分，返回一个 Temporal.PlainDate 对象;toString() 转换为字符串
    }
    return `${date.toPlainDate().toString()} ${date.toPlainTime().toString()}`; // TODO:toPlainDateTime() 获取日期和时间部分，返回一个 Temporal.PlainDateTime 对象;toString() 转换为字符串
}

export const numToTime = (num) => {
    const datePoint = Temporal.Instant.fromEpochMilliseconds(num); // TODO:fromEpochMilliseconds （毫秒）时间戳转换为时间点
    const date = datePoint.toZonedDateTimeISO(Temporal.Now.timeZoneId()); // TODO:转换为带时区的日期时间对象;获取当前时区的标识符

    return `${date.toPlainDate().toString()} ${date.toPlainTime().toString()}`;
}