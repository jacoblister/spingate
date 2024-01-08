init("0000000000000")

Z = bit(0, "0")
A = bit(1, "A")
B = bit(2, "B")
C = bit(3, "C")
D = bit(4, "D")
E = bit(5, "E")
F = bit(6, "F")
G = bit(7, "G")
DP = bit(8, "DP")
B3 = bit(9, "B3")
B2 = bit(10, "B2")
B1 = bit(11, "B1")
B0 = bit(12, "B0")

S7 = seg7(DP, A, "S7")
Y = reg(B0, B3, "Y")

toggle = (dst) => nand(dst, dst)
set = (dst) => nand(Z, dst)
clear = (dst) => set(dst) + nand(dst, dst)
copy = (src, dst) => set(dst) + nand(src, dst) + nand(dst, dst)
swap = (src, dst, tmp) => copy(src, tmp) + copy(dst, src) + copy(tmp, dst)
and = (src, dst) => nand(src, dst) + nand(dst, dst)
or = (src, dst) => toggle(dst) + toggle(src) + nand(src, dst) + nand(dst, dst) + toggle(dst) + toggle(src)

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

num0 = []
num1 = [A]
num2 = [B]
num3 = [A, B]
num4 = [F]
num5 = [F, A]
num6 = [F, B]
num7 = [F, B, A]
num8 = [G]
num9 = [G, A]

segToggle = (dig) => dig.reduce((acc, bit) => acc + toggle(bit), "")
segClearIf = (dig, DP) => dig.reduce((acc, bit) => acc + and(DP, bit), "")
segSetIf = (dig, DP) => dig.reduce((acc, bit) => acc + or(DP, bit), "")
test = () => clear(DP) + or(A, DP) + or(B, DP) + or(C, DP) + or(D, DP) + or(E, DP) + or(F, DP) + or(G, DP)
convert = (dig, num) => segToggle(dig) + test() + segToggle(dig) + segClearIf(all, DP) + toggle(DP) + segSetIf(num, DP)

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
prog("tog0", segToggle(dig0))
prog("tog3", segToggle(dig3))
prog("toNum",
    convert(dig0, num0) + convert(dig1, num1) + convert(dig2, num2) + convert(dig3, num3) + convert(dig4, num4) +
    convert(dig5, num5) + convert(dig6, num6) + convert(dig7, num7) + convert(dig8, num8) + convert(dig9, num9)
)
prog("toSeg",
    convert(num0, dig0) + convert(num1, dig1) + convert(num2, dig2) + convert(num3, dig3) + convert(num4, dig4) +
    convert(num5, dig5) + convert(num6, dig6) + convert(num7, dig7) + convert(num8, dig8) + convert(num9, dig9)
)
