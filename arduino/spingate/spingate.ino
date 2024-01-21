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
  static int spin_button = 0;
  static int gate_button = 0;

  int spin_button_next = readButton(0);
  int gate_button_next = readButton(1);

  if (spin_button_next && spin_button_next != spin_button)
  {
    result = 1;
  }

  if (gate_button_next && gate_button_next != gate_button)
  {
    result = 2;
  }

  spin_button = spin_button_next;
  gate_button = gate_button_next;

  return result;
}

int spin_or_gate = 0;
int pulse_ticks = 0;

void loop()
{
  int button = readButtons();
  if (button != 0) {
    spin_or_gate = button - 1;
    pulse_ticks = 50;
  }
  
  writeSignals(spin_or_gate,
               pulse_ticks < 25 && pulse_ticks > 0,
               pulse_ticks < 25 && pulse_ticks > 0 && spin_or_gate == 0);

  if (pulse_ticks > 0)
  {
    pulse_ticks--;
  }
  else
  {
    spin_or_gate = 0;
  }

  // delay(1);
  delayMicroseconds(1000);
}