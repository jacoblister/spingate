// #include <avr/io8535.h>
// #include <avr/iom328p.h>

void setupHardWare();
int readButton(int index);
void writeSignals(int op, int clock_gate, int clock_spin);

#if defined(__AVR_ATmega328P__)
int pin_out0 = 10;
int pin_out1 = 11;
int pin_out2 = 12;

int in0_pin = 3;
int in1_pin = 4;
int in1_gnd_pin = 6;
int in2_pin = 7;
int in2_gnd_pin = 9;

void setupHardWare()
{
  pinMode(pin_out0, OUTPUT);
  pinMode(pin_out1, OUTPUT);
  pinMode(pin_out2, OUTPUT);

  pinMode(in0_pin, INPUT_PULLUP);
  pinMode(in1_pin, INPUT_PULLUP);
  pinMode(in1_gnd_pin, OUTPUT);
  digitalWrite(in1_gnd_pin, LOW);
  pinMode(in2_pin, INPUT_PULLUP);
  pinMode(in2_gnd_pin, OUTPUT);
  digitalWrite(in2_gnd_pin, LOW);
}

int readButton(int index)
{
  if (index == 0)
  {
    return !digitalRead(in0_pin);
  }
  if (index == 1)
  {
    return !digitalRead(in1_pin);
  }
  if (index == 2)
  {
    return !digitalRead(in2_pin);
  }
}

void writeSignals(int op, int clock_gate, int clock_spin)
{
  PORTB = (op ? (1 << 2) : 0) |
          (clock_gate ? (1 << 3) : 0) |
          (clock_spin ? (1 << 4) : 0);
}
#endif

#if defined(__AVR_ATtiny85__)
int pin_out0 = 2;
int pin_out1 = 1;
int pin_out2 = 0;

int in0_pin = 5;
int in1_pin = 3;
int in2_pin = 4;

void setupHardWare()
{
  pinMode(pin_out0, OUTPUT);
  pinMode(pin_out1, OUTPUT);
  pinMode(pin_out2, OUTPUT);

  pinMode(A0, INPUT);
  pinMode(in1_pin, INPUT_PULLUP);
  pinMode(in2_pin, INPUT_PULLUP);
}

int readButton(int index)
{
  if (index == 0)
  {
    return analogRead(A0) < 930;
  }
  if (index == 1)
  {
    return !digitalRead(in1_pin);
  }
  if (index == 2)
  {
    return !digitalRead(in2_pin);
  }
}

void writeSignals(int op, int clock_gate, int clock_spin)
{
  PORTB = (PORTB & 0b11111000) | 
          (op ? (1 << 2) : 0) |
          (clock_gate ? (1 << 1) : 0) |
          (clock_spin ? (1 << 0) : 0);
}
#endif

void setup()
{
  setupHardWare();
}

int readButtons(void) {
  int result = 0;
  static int button0 = 0;
  static int button1 = 0;
  static int button2 = 0;

  int button0_next = readButton(0);
  int button1_next = readButton(1);
  int button2_next = readButton(2);

  if (button0_next && button0_next != button0)
  {
    result = 1;
  }

  if (button1_next && button1_next != button1)
  {
    result = 2;
  }

  if (button2_next && button2_next != button2)
  {
    result = 3;
  }

  button0 = button0_next;
  button1 = button1_next;
  button2 = button2_next;

  return result;
}

byte progSpin[] = {0x00, 0x01, 0x00};
byte progGate[] = {0x00, 0x01, 0x01};
byte progSpinBack[] = {0x00, 0x0C, 0x00};
byte *progActive = NULL; 
int progIndex = 0;
int progPhase = 0;
int divider = 0;

#define DIVIDER 1

void loop()
{
  if (progActive) {
    if (divider == 0) {
      int length = progActive[1];
      int bit = progActive[2];
      if (progPhase == 0) {
        if (progIndex == length) {
          progActive = NULL;
          bit = 0;
        }
        writeSignals(bit, 0, 0);

        progPhase = 1;
      } else {
        writeSignals(bit, 1, !bit);

        progPhase = 0;
        progIndex++;
      }

      divider = DIVIDER;
    } else {
      divider--;
    }
  } else {
    int button = readButtons();
    if (button != 0) {
      if (button == 1) {
        progActive = progSpin;
      }
      if (button == 2) {
        progActive = progGate;
      }
      if (button == 3) {
        progActive = progSpinBack;
      }

      progIndex = 0;
      progPhase = 0;
    }
  }

  delayMicroseconds(1000);
}