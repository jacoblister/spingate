let cpu = {data: 0, bits: 13, index: 0, store: false, accum:0, prog: []}

function init(register) {
    next = {data: 0, bits: 4, index: 0, store: false, accum: 0, prog: []}
}

function prog(name, data) {
    next.prog.push({name, data})
}

function done() {
    cpu = next
}

function loadProgram(program) {
    try {
        eval(program)
    }
    finally {
        done()
    }
}

function spin() {
    cpu.data = cpu.data << 1 | (cpu.data >> (cpu.bits - 1))
}

function gate() {
    if (cpu.store) {
        cpu.data = (cpu.data & -2) | !(cpu.accum & (cpu.data & 1))
    } else {
        cpu.accum = cpu.data & 1
    }
    cpu.store = !cpu.store
}

function dump() {
    let data = ""
    for (i = 0; i < cpu.bits; i++) {
        data = (cpu.data & (1 << i) ? "1" : "0") + data
    }
    console.log("store:", cpu.store)
    console.log("accum:", cpu.accum)
    console.log("data:", data)
}

function exec(program) {
    
}

function nand(bitA, bitB, bitOut) {

}