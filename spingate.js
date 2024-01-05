let cpu = {}

function init(register) {
    next = {data: 0, bits: register.length, index: 0, store: false, accum: 0, prog: [], speed: "Medium"}
    next.label = [...Array(register.length).keys()].map(i => i + "")
}

let pos = 0

function prog(name, code) {
    while (pos != 0) {
        code = code + "0"
        pos = (pos + next.bits - 1) % next.bits
    }

    next.prog.push({name, code})
}

function nand(dst, src) {
    let code = ""
    while (pos != src) {
        code = code + "0"
        pos = (pos + next.bits - 1) % next.bits
    }
    code = code + "1"
    while (pos != dst) {
        code = code + "0"
        pos = (pos + next.bits - 1) % next.bits
    }
    code = code + "1"
    
    return code
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
    cpu.data = cpu.data & ((1 << cpu.bits) - 1)
}

function gate() {
    if (cpu.store) {
        let next = !(cpu.accum & (cpu.data & 1))
        cpu.data = (cpu.data & -2) | next
        cpu.accum = next
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

function step() {
    code = cpu.code[0]
    if (code == "0") { spin() }
    if (code == "1") { gate() }
    cpu.code = cpu.code.slice(1)
    
    return cpu.code.length > 0
}

function exec(code) {
    cpu.code = code
    while (step()) {}
}

init("0000")
done()