const logger = {
  info: (data: any) =>
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        ...data,
      })
    ),
  warn: (data: any) =>
    console.log(
      JSON.stringify({
        level: "warn",
        timestamp: new Date().toISOString(),
        ...data,
      })
    ),
  error: (data: any) =>
    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        ...data,
      })
    ),
  debug: (data: any) =>
    console.log(
      JSON.stringify({
        level: "debug",
        timestamp: new Date().toISOString(),
        ...data,
      })
    ),
};

export default logger;
