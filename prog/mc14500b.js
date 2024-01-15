init("00000000000000000000")

Z = 0
T_TEST = 1
T_TMP = 2
T_DATA = 3
T3 = 4
I3 = bit(5, "I3")
I2 = bit(6, "I2")
I1 = bit(7, "I1")
I0 = bit(8, "I0")
DI = bit(9, "DI")
DO = bit(10, "DO")
W = bit(11, "W")
RR = bit(12, "RR")
JP = bit(13, "JP")
RT = bit(14, "RT")
FO = bit(15, "FO")
FF = bit(16, "FF")
ie = bit(17, "ie")
oe = bit(18, "oe")
sk = bit(19, "sk")

NOPO = []
LD = [I0]
LDC = [I1]
AND = [I1, I0]
ANDC = [I2]
OR = [I2, I0]
ORC = [I2, I1]
XNOR = [I2, I1, I0]
STO = [I3]
STOC = [I3, I0]
IEN = [I3, I1]
OEN = [I3, I1, I0]
JMP = [I3, I2]
RTN = [I3, I2, I0]
SKZ = [I3, I2, I1]
NOPF = [I3, I2, I1, I0]

toggle = (dst) => nand(dst, dst)
set = (dst) => nand(Z, dst)
clear = (dst) => set(dst) + nand(dst, dst)
copy = (src, dst) => set(dst) + nand(src, dst) + nand(dst, dst)
swap = (src, dst, tmp) => copy(src, tmp) + copy(dst, src) + copy(tmp, dst)
and = (src, dst) => nand(src, dst) + nand(dst, dst)
or = (src, dst) => toggle(dst) + toggle(src) + nand(src, dst) + nand(dst, dst) + toggle(dst) + toggle(src)
xor = (src, dst, tmpA) => copy(src, tmpA) + nand(dst, tmpA) + nand(tmpA, dst) + nand(src, tmpA) + nand(tmpA, dst)
setBits = (pattern, bits) => bits.reduce((acc, bit) => acc + clear(bit), "") + pattern.reduce((acc, bit) => acc + set(bit), "")
testBits = (pattern, bits, dst) => clear(dst) +
    pattern.reduce((acc, bit) => acc + toggle(bit), "") +
    bits.reduce((acc, bit) => acc + or(bit, dst), "") +
    pattern.reduce((acc, bit) => acc + toggle(bit), "") +
    toggle(dst)
setIf = (tst, dst) => clear(dst) + or(tst, dst)
copyIf = (tst, src, dst) => copy(src, T_TMP) + and(tst, T_TMP) + toggle(tst) + and(tst, dst) + toggle(tst) + or(T_TMP, dst)
inst = (pattern) => setBits(pattern, [I3, I2, I1, I0])
instTest = (pattern, dst) => testBits(pattern, [I3, I2, I1, I0], dst)
skipTest = (dst) => toggle(sk) + and(sk, dst) + toggle(sk)

copyDI = (dst) => copy(DI, dst) + and(ie, dst)

doexec = (pattern) => 
    inst(pattern) + 
    instTest(NOPO, T_TEST) + setIf(T_TEST, FO) + 
    instTest(LD, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + copyIf(T_TEST, T_DATA, RR) + 
    instTest(LDC, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + toggle(T_DATA) + copyIf(T_TEST, T_DATA, RR) + 
    instTest(AND, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + and(RR, T_DATA) + copyIf(T_TEST, T_DATA, RR) + 
    instTest(ANDC, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + toggle(T_DATA) + and(RR, T_DATA) + copyIf(T_TEST, T_DATA, RR) + 
    instTest(OR, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + or(RR, T_DATA) + copyIf(T_TEST, T_DATA, RR) + 
    instTest(ORC, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + toggle(T_DATA) + or(RR, T_DATA) + copyIf(T_TEST, T_DATA, RR) + 
    instTest(XNOR, T_TEST) + skipTest(T_TEST) + copyDI(T_DATA) + toggle(T_DATA) + xor(RR, T_DATA, T_TMP) + copyIf(T_TEST, T_DATA, RR) + 

    clear(W) + 
    instTest(STO, T_TEST) + skipTest(T_TEST) + and(oe, T_TEST) + copyIf(T_TEST, RR, DO) + or(T_TEST, W) + 
    instTest(STOC, T_TEST) + skipTest(T_TEST) + and(oe, T_TEST) + copy(RR, T_DATA) + toggle(T_DATA) + copyIf(T_TEST, T_DATA, DO) + or(T_TEST, W) +

    instTest(IEN, T_TEST) + skipTest(T_TEST) + copyIf(T_TEST, DI, ie) +
    instTest(OEN, T_TEST) + skipTest(T_TEST) + copyIf(T_TEST, DI, oe) +

    clear(sk) + 

    instTest(RTN, T_TEST) + setIf(T_TEST, RT) + setIf(T_TEST, sk) +
    instTest(SKZ, T_TEST) + skipTest(T_TEST) + copyIf(T_TEST, RR, sk) +
    instTest(JMP, T_TEST) + setIf(T_TEST, JP) +
    instTest(NOPF, T_TEST) + setIf(T_TEST, FF)

prog("DI=!DI", nand(DI, DI))
prog("NOPO", doexec(NOPO))
prog("LD", doexec(LD))
prog("LDC", doexec(LDC))
prog("AND", doexec(AND))
prog("ANDC", doexec(ANDC))
prog("OR", doexec(OR))
prog("ORC", doexec(ORC))
prog("XNOR", doexec(XNOR))
prog("STO", doexec(STO))
prog("STOC", doexec(STOC))
prog("IEN", doexec(IEN))
prog("OEN", doexec(OEN))
prog("JMP", doexec(JMP))
prog("RTN", doexec(RTN))
prog("SKZ", doexec(SKZ))
prog("NOPF", doexec(NOPF))
