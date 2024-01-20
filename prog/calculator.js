init("0000000000000")

Z = bit(0, "0")
C = bit(1, "C")
DP = bit(2, "DP")
E = bit(3, "E")
D = bit(4, "D")
F = bit(5, "F")
G = bit(6, "G")
B = bit(7, "B")
A = bit(8, "A")
B3 = bit(9, "B3")
B2 = bit(10, "B2")
B1 = bit(11, "B1")
B0 = bit(12, "B0")

A0 = A
A1 = B
A2 = G
A3 = F

S7 = seg7(A, DP, "S7", [A, B, C, D, E, F, G, DP])
REG_A = [A0, A1, A2, A3]
REG_B = reg(B0, B3, "B")

toggle = (dst) => nand(dst, dst)
set = (dst) => nand(Z, dst)
clear = (dst) => set(dst) + nand(dst, dst)
copy = (src, dst) => set(dst) + nand(src, dst) + nand(dst, dst)
swap = (src, dst, tmp) => copy(src, tmp) + copy(dst, src) + copy(tmp, dst)
and = (src, dst) => nand(src, dst) + nand(dst, dst)
or = (src, dst) => toggle(dst) + toggle(src) + nand(src, dst) + toggle(src)
xor = (src, dst, tmpA) => copy(src, tmpA) + nand(dst, tmpA) + nand(tmpA, dst) + nand(src, tmpA) + nand(tmpA, dst)
halfadd = (src, dst, carry, tmpA) => copy(dst, carry) + xor(src, dst, tmpA) + and(src, carry)
fulladd = (src, dst, carry, tmpA, tmpB) => halfadd(carry, dst, tmpA, tmpB) + copy(tmpA, carry) + halfadd(src, dst, tmpA, tmpB) + or(tmpA, carry)
add4 = (src, dst, carry, tmpA, tmpB) =>
    halfadd(src[0], dst[0], carry, tmpA, tmpB) +
    fulladd(src[1], dst[1], carry, tmpA, tmpB) +
    fulladd(src[2], dst[2], carry, tmpA, tmpB) +
    fulladd(src[3], dst[3], carry, tmpA, tmpB)

all = [A, B, C, D, E, F, G]
dig = [
    [A, B, C, D, E, F], [B, C], [A, B, D, E, G], [A, B, C, D, G],
    [B, C, F, G], [A, C, D, F, G], [A, C, D, E, F, G], [A, B, C],
    [A, B, C, D, E, F, G], [A, B, C, D, F, G], [A, B, C, E, F, G], [C, D, E, F, G],
    [A, D, E, F], [B, C, D, E, G], [A, D, E, F, G], [A, E, F, G]
]
num = [
    [], [A0], [A1], [A0, A1], [A2], [A2, A0], [A2, A1], [A2, A1, A0],
    [A3], [A3, A0], [A3, A1], [A3, A0, A1], [A3, A2], [A3, A2, A0], [A3, A2, A1], [A3, A2, A1, A0]
]

clearBits = (bits) => bits.reduce((acc, bit) => acc + clear(bit), "")
segToggle = (dig) => dig.reduce((acc, bit) => acc + toggle(bit), "")
segClearIf = (dig, DP) => dig.reduce((acc, bit) => acc + and(DP, bit), "")
segSetIf = (dig, DP) => dig.reduce((acc, bit) => acc + or(DP, bit), "")
test = (pattern, bits, dst) => clear(dst) +
    pattern.reduce((acc, bit) => acc + toggle(bit), "") + 
    bits.reduce((acc, bit) => acc + or(bit, dst), "") +
    pattern.reduce((acc, bit) => acc + toggle(bit), "")
convert = (from, to) => test(from, all, DP) + segClearIf(all, DP) + toggle(DP) + segSetIf(to, DP) + clear(DP)
toNum = () => dig.reduce((acc, value, i) => acc + convert(value, num[i]), "")
toSeg = () => num.reduce((acc, value, i) => acc + convert(value, dig[i]), "")
swapAB = () => swap(A0, B0, C) + swap(A1, B1, C) + swap(A2, B2, C) + swap(A3, B3, C)
clearA = () => clear(DP) + clear(G) + clear(F) + clear(E) + clear(D) + clear(C) + clear(B) + clear(A)
neg4 = (dst, carry, tmpA, tmpB, zero, one) =>
    toggle(dst[0]) + toggle(dst[1]) + toggle(dst[2]) + toggle(dst[3]) +
    set(one) + add4([one, zero, zero, zero], dst, carry, tmpA, tmpB)
setNum = (i) => toNum() + swapAB() + clearA() + num[i].reduce((acc, bit) => acc + set(bit), "") + toSeg()

prog("0", setNum(0))
prog("1", setNum(1))
prog("2", setNum(2))
prog("3", setNum(3))
prog("4", setNum(4))
prog("5", setNum(5))
prog("6", setNum(6))
prog("7", setNum(7))
prog("8", setNum(8))
prog("9", setNum(9))
prog("+", toNum() +
    add4(REG_B, REG_A, C, DP, E) +
    clearBits([C, DP, E, D]) +
    toSeg()
)
prog("-", toNum() +
    neg4([B0, B1, B2, B3], C, DP, E, Z, D) +
    add4(REG_B, REG_A, C, DP, E) +
    neg4([B0, B1, B2, B3], C, DP, E, Z, D) +
    clearBits([C, DP, E, D]) +
    toSeg()
)
prog("Swap", toNum() +
    swapAB() +
    clearBits([C, DP, E, D]) +
    toSeg()
)
