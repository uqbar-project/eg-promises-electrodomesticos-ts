function imprimiteUn2() {
  console.log(2)
}

function main() {
  console.log(1)
  setTimeout(() => { console.log(4) }, 150)
  setTimeout(imprimiteUn2, 0)
  console.log(3)
}

main()