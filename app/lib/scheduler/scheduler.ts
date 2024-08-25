/**
 *
 * @param startDate
 * @param endDate
 * @param tasks
 * @param settings an object including greedy, which determines whether or not to schedule tasks as early as possible,
 */

type scheduledTask = {
  name: string;
  singleDay: boolean;
  startDay: Date;
  startTimes: number[];
  endTimes: number[];
};
export function scheduleTasks(
  startDate: Date,
  endDate: Date,
  tasks: { duration: number; name: string; continuous: boolean }[],
  settings: {
    greedy: boolean;
    maxHoursPerDay: number;
    startTime: number;
  }
): scheduledTask[] {
  let currentDay = new Date(startDate);
  const scheduledTasks: scheduledTask[] = [];
  if (settings.greedy) {
    let remainingTimeInDay = settings.maxHoursPerDay;
    for (const task of tasks) {
      if (remainingTimeInDay == 0) {
        currentDay.setDate(currentDay.getDate() + 1);
        remainingTimeInDay = settings.maxHoursPerDay;
      }
      if (currentDay.getTime() >= endDate.getTime()) {
        throw new Error("Unable to schedule greedily");
      }
      if (task.continuous) {
        if (task.duration > settings.maxHoursPerDay) {
          throw new Error("A continuous task duration exceeds maxHoursPerDay");
        } else if (task.duration > remainingTimeInDay) {
          //make new day
          currentDay.setDate(currentDay.getDate() + 1);
          scheduledTasks.push({
            name: task.name,
            singleDay: true,
            startDay: currentDay,
            startTimes: [settings.startTime],
            endTimes: [settings.startTime + task.duration],
          });
          remainingTimeInDay = settings.maxHoursPerDay - task.duration;
        } else {
          //add to current day
          scheduledTasks.push({
            name: task.name,
            singleDay: true,
            startDay: currentDay,
            startTimes: [
              settings.startTime + settings.maxHoursPerDay - remainingTimeInDay,
            ],
            endTimes: [
              settings.startTime +
                settings.maxHoursPerDay -
                remainingTimeInDay +
                task.duration,
            ],
          });
          remainingTimeInDay -= task.duration;
        }
      } else {
        //do as much as you can in the current day, then go to new day
        const startTimes = [];
        const endTimes = [];
        let duration = task.duration;
        const startDay = new Date(currentDay);
        while (duration > 0) {
          if (duration > remainingTimeInDay) {
            startTimes.push(
              settings.startTime + settings.maxHoursPerDay - remainingTimeInDay
            );
            endTimes.push(settings.startTime + settings.maxHoursPerDay);
            duration -= remainingTimeInDay;
            remainingTimeInDay = settings.maxHoursPerDay;
            currentDay.setDate(currentDay.getDate() + 1);
          } else {
            startTimes.push(
              settings.startTime + settings.maxHoursPerDay - remainingTimeInDay
            );
            endTimes.push(
              settings.startTime +
                settings.maxHoursPerDay -
                remainingTimeInDay +
                task.duration
            );
            remainingTimeInDay -= duration;
            duration = 0;
          }
        }
        scheduledTasks.push({
          name: task.name,
          singleDay: false,
          startDay: startDay,
          startTimes: startTimes,
          endTimes: endTimes,
        });
      }
    }
  } else {
    throw new Error("Non-greedy scheduler not yet implemented");
  }
  return scheduledTasks;
}
