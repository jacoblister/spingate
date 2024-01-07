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
dig0 = [G]
dig1 = [A, D, E, F, G]
dig2 = [F, C]
dig3 = [E, F]
dig4 = [A, D, E]
num0 = []
num1 = [A]
num2 = [B]
num3 = [A, B]
num4 = [C]

segToggle = (dig) => dig.reduce((acc, bit) => acc + toggle(bit), "")
segClearIf = (dig, DP) => dig.reduce((acc, bit) => acc + and(DP, bit), "")
segSetIf = (dig, DP) => dig.reduce((acc, bit) => acc + or(DP, bit), "")
test = () => set(DP) + and(A, DP) + and(B, DP) + and(C, DP) + and(D, DP) + and(E, DP) + and(F, DP) + and(G, DP)
segToNum = (dig, num) => segToggle(dig) + test() + segToggle(dig) + toggle(DP) + segClearIf(all, DP) + toggle(DP) + segSetIf(num, DP)

prog("A", toggle(A))
prog("B", toggle(B))
prog("C", toggle(C))
prog("D", toggle(D))
prog("E", toggle(E))
prog("F", toggle(F))
prog("G", toggle(G))
prog("DP", toggle(DP))
prog("test", test())
prog("tog0", segToggle(dig0))
prog("tog3", segToggle(dig3))
prog("3", segToNum(dig3, num3))
prog("toNum", segToNum(dig0, num0) + segToNum(dig1, num1) + segToNum(dig2, num2) + segToNum(dig3, num3) + segToNum(dig4, num4))