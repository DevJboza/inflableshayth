export type ScheduleInput = {
  recipients: number;
  dailyLimit: number;
  startDate: string;
  allowedDays: number[];
};

export function estimateCompletion({
  recipients,
  dailyLimit,
  startDate,
  allowedDays,
}: ScheduleInput) {
  if (recipients <= 0 || dailyLimit <= 0 || !allowedDays.length) return null;
  const date = new Date(`${startDate}T12:00:00-06:00`);
  let remainingDays = Math.ceil(recipients / dailyLimit);
  for (let guard = 0; guard < 3700; guard += 1) {
    const isoDay = date.getDay() === 0 ? 7 : date.getDay();
    if (allowedDays.includes(isoDay)) remainingDays -= 1;
    if (remainingDays === 0) return date.toISOString().slice(0, 10);
    date.setDate(date.getDate() + 1);
  }
  return null;
}
