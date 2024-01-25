let cpu = {}

function init(register) {
    next = { data: 0, bits: register.length, index: 0, store: false, accum: 0, prog: [], reg: [], speed: "Medium", code: "" }
    next.label = Array(register.length).fill("")

    for (i = 0; i < next.bits; i++) {
        if (register[i] == "1") {
            next.data |= (1 << i)
        }
    }
}

function bit(index, label) {
    next.label[index] = label
    return index
}

function reg(from, to, label, seg7bits) {
    let bits = []
    if (seg7bits) {
        bits = seg7bits
    } else {
        for (i = from; i >= to; i--) {
            bits.push(i)
        }
    }

    next.reg.push({ from, to, bits, label, seg7: seg7bits ? 1 : undefined })

    return bits
}

function seg7(from, to, label, bits) {
    return reg(from, to, label, bits)
}

let pos = 0

function prog(name, code) {
    while (pos != 0) {
        code = code + "0"
        pos = (pos + next.bits - 1) % next.bits
    }

    next.prog.push({ name, code })
}

function nand(src, dst) {
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
    while (step()) { }
}

function encode(code) {
    let bytes = []

    for (i = 0; i < code.length; i++) {
        bytes[i >> 3] |= code[i] == "1" ? (1 << (7 - (i & 7))) : 0;
    }

    bytes = [code.length >> 8, code.length & 0xFF].concat(bytes)

    let result = "{"
    for (i = 0; i < bytes.length; i++) {
        result += "0x" + (bytes[i]).toString(16).padStart(2, '0')
        if (i < bytes.length - 1) { result += "," }
        if (i % 16 == 15) { result += '\n' }
    }

    result += "}"
    
    return result
}

init("0000")
done()
