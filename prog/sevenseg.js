init("0000000000000")

Z = bit(0, "0")
// DP = bit(1, "DP")
// A = bit(2, "A")
// B = bit(3, "B")
// C = bit(4, "C")
// D = bit(5, "D")
// E = bit(6, "E")
// F = bit(7, "F")
// G = bit(8, "G")
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
or = (src, dst) => toggle(dst) + toggle(src) + nand(src, dst) + nand(dst, dst) + toggle(dst) + toggle(src)
xor = (src, dst, tmpA) => copy(src, tmpA) + nand(dst, tmpA) + nand(tmpA, dst) + nand(src, tmpA) + nand(tmpA, dst)
halfadd = (src, dst, carry, tmpA) => copy(dst, carry) + xor(src, dst, tmpA) + and(src, carry)
fulladd = (src, dst, carry, tmpA, tmpB) => halfadd(carry, dst, tmpA, tmpB) + copy(tmpA, carry) + halfadd(src, dst, tmpA, tmpB) + or(tmpA, carry)
add4 = (src, dst, carry, tmpA, tmpB) =>
    halfadd(src[0], dst[0], carry, tmpA, tmpB) +
    fulladd(src[1], dst[1], carry, tmpA, tmpB) +
    fulladd(src[2], dst[2], carry, tmpA, tmpB) +
    fulladd(src[3], dst[3], carry, tmpA, tmpB)

all = [A, B, C, D, E, F, G]
dig0 = [A, B, C, D, E, F]
dig1 = [B, C]
dig2 = [A, B, D, E, G]
dig3 = [A, B, C, D, G]
dig4 = [B, C, F, G]
dig5 = [A, C, D, F, G]
dig6 = [A, C, D, E, F, G]
dig7 = [A, B, C]
dig8 = [A, B, C, D, E, F, G]
dig9 = [A, B, C, D, F, G]
digA = [A, B, C, E, F, G]
digB = [C, D, E, F, G]
digC = [A, D, E, F]
digD = [B, C, D, E, G]
digE = [A, D, E, F, G]
digF = [A, E, F, G]

num0 = []
num1 = [A0]
num2 = [A1]
num3 = [A0, A1]
num4 = [A2]
num5 = [A2, A0]
num6 = [A2, A1]
num7 = [A2, A1, A0]
num8 = [A3]
num9 = [A3, A0]
numA = [A3, A1]
numB = [A3, A0, A1]
numC = [A3, A2]
numD = [A3, A2, A0]
numE = [A3, A2, A1]
numF = [A3, A2, A1, A0]

segToggle = (dig) => dig.reduce((acc, bit) => acc + toggle(bit), "")
segClearIf = (dig, DP) => dig.reduce((acc, bit) => acc + and(DP, bit), "")
segSetIf = (dig, DP) => dig.reduce((acc, bit) => acc + or(DP, bit), "")
test = () => clear(DP) + or(A, DP) + or(B, DP) + or(C, DP) + or(D, DP) + or(E, DP) + or(F, DP) + or(G, DP)
convert = (dig, num) => segToggle(dig) + test() + segToggle(dig) + segClearIf(all, DP) + toggle(DP) + segSetIf(num, DP)
toNum = () => convert(dig0, num0) + convert(dig1, num1) + convert(dig2, num2) + convert(dig3, num3) + convert(dig4, num4) +
    convert(dig5, num5) + convert(dig6, num6) + convert(dig7, num7) + convert(dig8, num8) + convert(dig9, num9) +
    convert(digA, numA) + convert(digB, numB) + convert(digC, numC) + convert(digD, numD) + convert(digE, numE) + convert(digF, numF)
toSeg = () => convert(num0, dig0) + convert(num1, dig1) + convert(num2, dig2) + convert(num3, dig3) + convert(num4, dig4) +
    convert(num5, dig5) + convert(num6, dig6) + convert(num7, dig7) + convert(num8, dig8) + convert(num9, dig9) +
    convert(numA, digA) + convert(numB, digB) + convert(numC, digC) + convert(numD, digD) + convert(numE, digE) + convert(numF, digF)
copyBtoA = () => copy(B0, A0) + copy(B1, A1) + copy(B2, A2) + copy(B3, A3)
swapAB = () => swap(A0, B0, C) + swap(A1, B1, C) + swap(A2, B2, C) + swap(A3, B3, C)
clearA = () => clear(DP) + clear(G) + clear(F) + clear(E) + clear(D) + clear(C) + clear(B) + clear(A)

prog("A", toggle(A))
prog("B", toggle(B))
prog("C", toggle(C))
prog("D", toggle(D))
prog("E", toggle(E))
prog("F", toggle(F))
prog("G", toggle(G))
prog("DP", toggle(DP))
prog("test", test())
prog("togall", toggle(G) + toggle(F) + toggle(E) + toggle(D) + toggle(C) + toggle(B) + toggle(A))
prog("clearA", clearA())
prog("tog0", segToggle(dig0))
prog("tog3", segToggle(dig3))
prog("toNum", toNum())
prog("toSeg", toSeg())
prog("A<=>B", toNum() + swapAB() + clear(C) + clear(DP) + clear(E) + clear(D) + toSeg())
prog("A=A+B", toNum() + add4(REG_B, REG_A, C, DP, E) + clear(C) + clear(DP) + clear(E) + clear(D) + toSeg())
prog("0", toNum() + swapAB() + clearA() + toSeg())
prog("1", toNum() + swapAB() + clearA() + set(A0) + toSeg())
prog("2", toNum() + swapAB() + clearA() + set(A1) + toSeg())
prog("3", toNum() + swapAB() + clearA() + set(A1) + set(A0) + toSeg())
