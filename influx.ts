import { InfluxDB } from "@influxdata/influxdb-client";

const influx_url = "https:/influxdb.vigue.me";
const influx_token =
  "aERBZt9M3IepJTd-8V4akXrnsaF9Y54IrxcrZt2FUux7NKr2zDsgMQ6y35U3zzcJx5CkDt9be5T3ZyoQkwzmBg==";
export const queryApi = new InfluxDB({
  url: influx_url,
  token: influx_token,
}).getQueryApi("897b30781dfc9c78");

export const bucket = "3662824365498cdd";

export const viewDurationOptionsArray = [
  { label: "Last 5 minutes", value: (5 * 60 * 1000).toString() },
  { label: "Last 15 minutes", value: (15 * 60 * 1000).toString() },
  { label: "Last 30 minutes", value: (30 * 60 * 1000).toString() },
  { label: "Last hour", value: (60 * 60 * 1000).toString() },
  { label: "Last 3 hours", value: (3 * 60 * 60 * 1000).toString() },
  { label: "Last 12 hours", value: (12 * 60 * 1000).toString() },
  { label: "Last day", value: (24 * 60 * 60 * 1000).toString() },
  { label: "Since session start", value: (0).toString() },
];

export const viewRefreshIntervalOptionsArray = [
  { label: "Every second", value: (1000).toString() },
  { label: "Every 5 seconds", value: (5000).toString() },
  { label: "Every 15 seconds", value: (10000).toString() },
  { label: "Every 30 seconds", value: (30000).toString() },
  { label: "Every minute", value: (60000).toString() },
];

export const normalizeTimestamp = (epoch: number, units?: "ms" | "s") => {
  if (!units || units === "s") {
    if (epoch < 3.15e10) {
      return Math.round(epoch);
    } else {
      return Math.round(epoch / 1000);
    }
  } else {
    if (epoch < 3.15e10) {
      return Math.round(epoch * 1000);
    } else {
      return Math.round(epoch);
    }
  }
};

export const getColor = (index: number) => {
  const colors = [
    "#2caffe",
    "#544fc5",
    "#00e272",
    "#fe6a35",
    "#6b8abc",
    "#d568fb",
    "#2ee0ca",
    "#fa4b42",
    "#feb56a",
    "#91e8e1",
  ];
  return colors[index % colors.length];
};

export const durMaker = (start_epoch: number, end_epoch: number) => {
  const elapsed = end_epoch - start_epoch;
  const decimation =
    elapsed > 3600
      ? "2m"
      : elapsed > 1800
        ? "1m"
        : elapsed > 900
          ? "30s"
          : elapsed > 450
            ? "15s"
            : elapsed > 225
              ? "3s"
              : "1s";
  switch (decimation) {
    case "2m":
      return { dur: "2m", divisor: 30 };
    case "1m":
      return { dur: "1m", divisor: 60 };
    case "30s":
      return { dur: "30s", divisor: 120 };
    case "15s":
      return { dur: "15s", divisor: 240 };
    case "3s":
      return { dur: "3s", divisor: 1200 };
    case "1s":
      return { dur: "1s", divisor: 3600 };
  }
};

export const decimator = (
  start_epoch: number,
  end_epoch?: number,
  fn?: string
) => {
  const start = normalizeTimestamp(start_epoch);
  const end = end_epoch
    ? normalizeTimestamp(end_epoch)
    : normalizeTimestamp(Date.now());
  const decimation = durMaker(start, end).dur;
  return `aggregateWindow(every: ${decimation}, fn: ${fn ? fn : "mean"}, createEmpty: false)`;
};

export const ranger = (start_epoch: number, end_epoch?: number) => {
  const start = normalizeTimestamp(start_epoch);
  const end = end_epoch ? normalizeTimestamp(end_epoch) : undefined;
  return `range(start: ${start}${end ? `, stop: ${end}` : ""})`;
};

export interface EllipseDimensions {
  spread: number;
  depth: number;
  volume: number;
}

export const computeHeightAtPoint = (
  X: number,
  Y: number,
  dimensions: EllipseDimensions
): number => {
  const A = dimensions.depth / 2;
  const [B, C] = [dimensions.spread / 2, dimensions.spread / 2];

  const height_at_point =
    (2 * (C * Math.sqrt(A ** 2 * (B ** 2 - Y ** 2) - B ** 2 * X ** 2))) /
    (A * B);

  return height_at_point;
};

//Returns numbers in diameter! Not radius!!!
export const computeEllipseDimensions = (volume: number): EllipseDimensions => {
  //Given a ellipses volume, compute the spread radius assuming the total height is 1/2 the total width
  //V = ABC * pi * 4/3, ABC are radius. A is depth, B is width, C is height, B and C are the same, and are twice as A
  //Solve for A
  const A = Math.cbrt(3 / (2 * Math.PI)) * Math.cbrt(volume);
  const B = 2 * A;

  return { spread: B, depth: A, volume };
};

export type SessionStartStopTime = {
  start_time: number;
  stop_time: number;
};

export type SessionState = {
  session_times: SessionStartStopTime[];
};

export type Session = {
  session_name: string;
  depth_of_injection: number;
  state: SessionState;
};

export type SessionStatistics = {
  runtime: number;
};

export type TimeDisplayConfig = {
  session: boolean;
  session_times: SessionStartStopTime[];
  start_epoch: number;
  stop_epoch?: number;
  update_interval: number;
  auto_duration: number;
  auto_update: boolean;
};
