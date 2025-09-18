function delayedResponse() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
}

async function time(label, fn) {
  const start = new Date();
  await fn();
  console.log(
    (new Date() - start) / 1000, `seconds to load ${label}`
  );
}

time("sequential", async () => {
  await delayedResponse();
  await delayedResponse();
  await delayedResponse();
  await delayedResponse();
  await delayedResponse();
  await delayedResponse();
});

time("parallel", async () => {
  await Promise.all([
    delayedResponse(), 
    delayedResponse(), 
    delayedResponse(),
    delayedResponse(),
    delayedResponse(),
    delayedResponse(),
  ]);
});