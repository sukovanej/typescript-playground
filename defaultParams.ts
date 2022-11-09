function fn(date: Date = new Date()) {
  console.log(date);
}

function fn2(d: {x: number} = {x:1}) {
  d.x += 1;
  return d;
}
